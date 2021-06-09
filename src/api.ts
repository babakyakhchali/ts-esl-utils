import { EslConnectionToFs } from ".";
import { CCAgentStatus, ICall, ICCAgent, ICCMember, ICCQueue, ICCTier, IChannel } from "./fstypes";
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


export class FsCcApi {
    constructor(private fsapi: FsApi){

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
        this.updateAgent(name,'contact',contact);  
    }
    async getAgents(){
        return this.ccListApi<ICCAgent>('callcenter_config agent list')
    }
    private async updateAgent(name:string,attr:string,value:string){
        const r = await this.fsapi.executeString(`callcenter_config agent set status ${name} ${attr} ${value}`);
        if(!r.trimRight().endsWith('+OK')){
            console.error(r);
            throw "UpdateAgentError";            
        }
    }
    async setAgentStatus(name:string,status:CCAgentStatus){
        this.updateAgent(name,'status',status);        
    }    
}


export class FsStatusApi {
    constructor(private fsapi: FsApi){

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
}