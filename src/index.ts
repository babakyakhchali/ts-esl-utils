interface Header {
    name: string;
    value: any;
}

export interface ICmdResult {
    headers: Header[];
    hPtr?: any;
    body: string;
    type?: string;
    subclass?: string;
}

export function isError(r: ICmdResult) {
    return r.body && r.body.substr(0, 4).toLowerCase() == '-err'
}

export interface IEslEvent {
    getType(): string;
    getHeader(hdr: string): string;
    getBody(): string;
    serialize(format:'json'|'plain'|'xml'):string;
}

export class EslEventEx implements IEslEvent {    
    constructor(private event: IEslEvent) {

    }
    getType(): string {
        return this.event.getType();
    }
    getHeader(hdr: string): string {
        return this.event.getHeader(hdr);
    }
    getBody(): string {
        return this.event.getBody();
    }
    getVar(name: string) {
        return this.getHeader(`variable_${name}`);
    }
    serialize(format: "json" | "plain" | "xml"): string {
        return this.event.serialize(format);
     }
}

export class EslPGDResult extends EslEventEx {
    getDigits() {
        return this.getVar('esl_last_input');
    }
}





export interface IEslServerOpts {
    port: number;
    host: string;
    myevents?:boolean;
    onReady: () => void;
    onError: (e: any) => void;
    onConnection: (c: any) => void;
}

export class EslServer {
    constructor(private opts: IEslServerOpts) {
    }
    start() {
        const esl = require('modesl');
        let eslServer = new esl.Server({
            port: this.opts.port,
            host: this.opts.host,
            myevents: true
        }, this.opts.onReady);
        eslServer.on('error', this.opts.onError);
        eslServer.on('connection::ready', this.opts.onConnection);
    }
}

export type EslEventCallBack = (e:IEslEvent)=>void;

class EslConnection {
    constructor(protected conn: any) {
    }
    async api(command: string, args?: string){
        return this._promisify(false,this.conn.api,command,args);
    }
    async bgapi(command: string, args?: string){
        return this._promisify(false,this.conn.bgapi,command,args);
    }
    // async api(command: string, args?: string, bg?: boolean): Promise<ICmdResult> { //todo it is fucked on error
    //     args = args || '';
    //     bg = bg || false;
    //     return new Promise((res, rej) => {
    //         this.conn.on('error', rej);
    //         this.conn.on('esl::end', rej);
    //         let apiFunc = this.conn.api.bind(this.conn);
    //         if (bg) {
    //             apiFunc = this.conn.bgapi.bind(this.conn);
    //         }
    //         apiFunc(command, args, (r: any) => {
    //             this.conn.off('error', rej);
    //             this.conn.off('esl::end', rej);
    //             res(r);
    //         });
    //     });

    // }
    getInfo(){
        return this.conn.getInfo() as IEslEvent;
    }
    subscribe(events:string){
        return this._promisify(false,this.conn.subscribe,events);        
    }
    addEventHandler(eventName:string,callBack:EslEventCallBack){
        this.conn.on(eventName,callBack);
    }
    removeEventHandler(callBack:EslEventCallBack){
        this.conn.off(callBack);
    }
    linger(){
        return this._promisify(false,this.conn.sendRecv,'linger') as Promise<IEslEvent>;        
    }
    protected _promisify(hangupAware:boolean,ff:(...args:any[])=>void,...others:any[]){
        others = others||[];
        const self = this;
        return new Promise((res,rej)=>{            
            const cb = function(r:any){
                self.conn.off('error', rejcb);
                self.conn.off('esl::end', rejcb);
                res(r);
            }
            const rejcb = function(e:any){
                self.conn.off('error', rejcb);
                self.conn.off('esl::end', rejcb);
                if(hangupAware){
                    self.conn.off('esl::event::CHANNEL_HANGUP::**',rejcb);
                }
                rej(e);
            }
            cb.bind(this);
            rejcb.bind(this);
            others.push(cb);
            ff.apply(this.conn,others)            
            this.conn.on('error', rejcb);
            this.conn.on('esl::end', rejcb);
            if(hangupAware){
                this.conn.on('esl::event::CHANNEL_HANGUP::**',rejcb);
            }
        }) as Promise<IEslEvent>;
    }
    disconnect(){
        this.conn.disconnect();
    }
}

export class EslConnectionFromFs extends EslConnection {
    execute(app: string, args?: string) {
        return this._promisify(true,this.conn.execute,app,args);        
    }
    async executeEx(app: string, args?: string){
        return new EslEventEx(await this.execute(app,args));
    }

}

export class EslConnectionToFs extends EslConnection {
    constructor(conn?: any) {
        super(conn)
    }
    /**
     * 
     * @param ip 
     * @param port 
     * @param pass 
     * @param timeout in seconds
     */
    connect(ip: string, port: number, pass: string, timeout?: number) {
        const esl = require('modesl');

        return new Promise((res, rej) => {
            timeout = timeout || 7;
            this.conn = new esl.Connection(ip, port, pass, () => {
                res(this.conn); //TODO: change this to 'this'
                this.conn.off('error', rej);
                this.conn.off('esl::end', rej);
                clearTimeout(st);
            });
            this.conn.on('error', rej);
            this.conn.on('esl::end', rej);
            const st = setTimeout(() => {
                if (this.conn.socket) {
                    this.conn.socket.destroy('timeout');
                }
            }, timeout * 1000);
        });
    }
    callAndExecute(dialString: string, execString: string) {
        return this.bgapi('originate', `${dialString} ${execString}`);
    }
}

export class EslCall extends EslConnectionFromFs {
    constructor(conn: any) {
        super(conn);
    }
    setVariable(name: string, value: string | boolean | number) {
        return this.execute('set', `${name}=${value}`);
    }
    answer() {
        return this.execute('answer');
    }
    hangup(cause = 'NORMAL_CLEARING') {
        return this.execute('hangup', cause);
    }
    /**
     * 
     * @param path path to play
     * @param seekSamples You can append @@<samples> to the file name to specify a playback start position. This works predictably in PCM files, less predictably with compressed files such as mp3
     */
    playback(path: string, seekSamples?: number) {
        return this.execute('playback', path + (seekSamples ? `@@${seekSamples}` : ''))
    }
    async playAndGetDigits(min: string | number, max: string | number, tries: string | number,
        timeout: string | number, terminators: string, file: string,
        invalid_file: string, regexp?: string, digit_timeout?: string | number, transfer_on_failure?: string) {
        let r = await this.execute('play_and_get_digits',
            `${min} ${max} ${tries} ${timeout} ${terminators} ${file} ` +
            ` ${invalid_file} esl_last_input ${regexp || ''} ${digit_timeout || ''} ${transfer_on_failure || ''}`);
        return new EslPGDResult(r);
    }
}

export class EslCallEx extends EslCall{
    hangedUp = false;
    constructor(conn: any) {
        super(conn);
        conn.on('esl::event::CHANNEL_HANGUP::**',()=>{
            this.hangedUp = true;
        })
    }
    execute(app: string, args?: string){
        if(this.hangedUp){
            throw 'AlreadyHanggedUp';
        }
        return super.execute(app,args);
    }
}