import { parseStringPromise } from "xml2js";
import { EslConnectionToFs } from ".";
import { CCAgentStatus, ICall, ICCAgent, ICCMember, ICCQueue, ICCTier, IChannel, ISofiaProfileStatus, ISofiaRegistrationStatus, ISofiaStatusItem,IShowResult } from "./fstypes";
import { parseCSV } from "./utils";

export class FsApi {
    private executor:IApiExecutor;
    constructor(executeorType :'ESL'|'SSH'|'CMD',conf:IApiExecutorConf){
        if(executeorType == 'ESL'){            
            this.executor = new EslApiExecutor(conf);
        }else if(executeorType == 'SSH'){            
            this.executor = new SshApiExecutor();
        }else if(executeorType == 'CMD'){
            this.executor = new CmdApiExecutor();
        }else{
            throw 'InvalidExecutorType';
        }
    }
    init(){
        return this.executor.init();
    }
    executeString(s:string){
        return this.executor.executeString(s);
    }
    async show<T>(target:string,opts?:string):Promise<T[]>{
        const s = await this.executor.executeString('show '+target+(opts || ''));
        return parseCSV<T>(s);
    }
    close(){
        this.executor.close();
    }
}

interface IApiExecutor {
    executeString(apistr:string):Promise<string>;
    init():Promise<any>;
    close():void;
}

interface IApiExecutorConf {
    host?:string;
    sshUsername?:string;
    sshPassword?:string;

    eslPort?:number;    
    eslPassword?:string;
}

class EslApiExecutor implements IApiExecutor{
    esl:EslConnectionToFs;
    constructor(private conf:IApiExecutorConf){
        if(!conf || !conf.host || !conf.eslPort || !conf.eslPassword){
            throw 'EslExecutorConfInvalid';
        }
        this.esl = new EslConnectionToFs();
    }
    close(): void {
        this.esl.conn.disconnect();
    }
    async init(){
        return this.esl.connect(this.conf.host!,this.conf.eslPort!,this.conf.eslPassword!,10);
    }
    async executeString(apistr: string) {       
        const r = await this.esl.api(apistr); 
        return r.getBody();       
    } 
     
}

class SshApiExecutor implements IApiExecutor{
    close(): void {
        throw new Error("Method not implemented.");
    }
    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr: string) :Promise<string>{
        throw new Error("Method not implemented.");
    }   
}

class CmdApiExecutor implements IApiExecutor{
    close(): void {
        throw new Error("Method not implemented.");
    }
    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr: string):Promise<string> {
        throw new Error("Method not implemented.");
    }   
}



export class FsApiEx{

    constructor(private fsapi: FsApi){

    }

    public getAPI(){
        return this.fsapi;
    }

    public close(){
        this.fsapi.close();
    }
    
    public async ccListApi<T>(api:string){
        const r = await this.fsapi.executeString(api);
        if(!r.trim().endsWith('+OK')){
            return []
        }
        return parseCSV<T>(r,'|');
    }
    getQeueueMembers(queue:string){
        return  this.ccListApi<ICCMember>(`callcenter_config queue list members ${queue}`);        
    }    
    getTiers(){
        return  this.ccListApi<ICCTier>('callcenter_config tier list');        
    }
    getQueues(){
        return  this.ccListApi<ICCQueue>('callcenter_config queue list');        
    }
    async addAgent(name:string,contact:string,type:string='callback'){
        let r = await this.fsapi.executeString(`callcenter_config agent add ${name} ${type}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "AddAgentError";            
        }
        return this.updateAgent(name,'contact',contact);  
    }
    async getAgents(){
        return this.ccListApi<ICCAgent>('callcenter_config agent list')
    }
    async updateAgent(name:string,attr:string,value:string){
        const r = await this.fsapi.executeString(`callcenter_config agent set ${attr} ${name} '${value}'`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "UpdateAgentError";            
        }
        return r;
    }
    async setAgentStatus(name:string,status:CCAgentStatus){
        return this.updateAgent(name,'status',status);        
    } 

    async delTier(tier:ICCTier){
        const r = await this.fsapi.executeString(`callcenter_config tier del ${tier.queue} ${tier.agent}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "TierError";            
        }
    }

    async addTier(tier:ICCTier){
        const r = await this.fsapi.executeString(`callcenter_config tier add ${tier.queue} ${tier.agent} ${tier.level || 1} ${tier.position || 1}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "TierError";            
        }
    }

    async setTier(tier:ICCTier,param:'level'|'position'|'state',value:string){
        const r = await this.fsapi.executeString(`callcenter_config tier set ${param} ${tier.queue} ${tier.agent} ${value}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "TierError";            
        }
    }

    async reloadTier(tier:ICCTier){
        const r = await this.fsapi.executeString(`callcenter_config tier reload ${tier.queue} ${tier.agent}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "TierError";            
        }
    }

    async status(){
        return this.fsapi.executeString('status');
        
    }
    async getChannels(){
        return this.fsapi.show<IChannel>('channels');
        
    }
    async getCalls(){
        return this.fsapi.show<ICall>('calls');
        
    }
    async showJSON<T>(query:string){
        let r = await this.fsapi.executeString('show '+query+' as json')
        return JSON.parse(r) as Promise<IShowResult<T>>;
    }
    async killCall(uuid:string){
        const r = await this.fsapi.executeString(`uuid_kill ${uuid}`);
        if(!r.toLocaleLowerCase().includes('ok')){
            throw 'CallNotFound'
        }
    }
    async exists(uuid:string){
        const r = await this.fsapi.executeString(`uuid_exists ${uuid}`);
        return r == 'true';      
    }

    async sofiaStatus():Promise<ISofiaStatusItem[]>{
        const r = await this.fsapi.executeString('sofia xmlstatus');
        if(r.startsWith('-ERR sofia Command not found!')){
            throw new Error("ModuleNotLoaded");            
        }
        const j = await parseStringPromise(r,{explicitArray:false});
        if(j.profiles && j.profiles.profile){
            if(Array.isArray(j.profiles.profile)){
                return j.profiles.profile
            }else{
                return [j.profiles.profile];
            }
            
        }
        return [];
    }

    async sofiaProfileStatus(profile:string):Promise<ISofiaProfileStatus>{
        const r = await this.fsapi.executeString(`sofia xmlstatus profile ${profile}`);
        if(r.startsWith('-ERR sofia Command not found!')){
            throw new Error("ModuleNotLoaded");            
        }
        if(r.startsWith('Invalid Profile')){
            throw new Error("SofiaProfileNotLoaded");            
        }
        const j = await parseStringPromise(r,{explicitArray:false});
        
        return j.profile["profile-info"];
        
    }

    async sofiaProfileRegStatus(profile:string):Promise<ISofiaRegistrationStatus[]>{
        const r = await this.fsapi.executeString(`sofia xmlstatus profile ${profile} reg`);
        if(r.startsWith('-ERR sofia Command not found!')){
            throw new Error("ModuleNotLoaded");            
        }
        if(r.startsWith('Invalid Profile')){
            throw new Error("SofiaProfileNotLoaded");            
        }
        const j = await parseStringPromise(r,{explicitArray:false,trim:true});
        if(typeof j === 'string'){
            return [];
        }else if(j.profile.registration){
            return [j.profile.registration];
        }else {
            return j.profile.registrations.registration;
        }
    }
    
}
