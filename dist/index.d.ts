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
export declare function isError(r: ICmdResult): boolean | "";
export interface IEslEvent {
    getType(): string;
    getHeader(hdr: string): string;
    getBody(): string;
    serialize(format: 'json' | 'plain' | 'xml'): string;
}
export declare class EslEventEx implements IEslEvent {
    private event;
    constructor(event: IEslEvent);
    getType(): string;
    getHeader(hdr: string): string;
    getBody(): string;
    getVar(name: string): string;
    serialize(format: "json" | "plain" | "xml"): string;
}
export declare class EslPGDResult extends EslEventEx {
    getDigits(): string;
}
export interface IEslServerOpts {
    port: number;
    host: string;
    myevents?: boolean;
    onReady: () => void;
    onError: (e: any) => void;
    onConnection: (c: any) => void;
}
export declare class EslServer {
    private opts;
    constructor(opts: IEslServerOpts);
    start(): void;
}
export declare type EslEventCallBack = (e: IEslEvent) => void;
declare class EslConnection {
    conn: any;
    constructor(conn: any);
    api(command: string, args?: string): Promise<IEslEvent>;
    bgapi(command: string, args?: string): Promise<IEslEvent>;
    getInfo(): IEslEvent;
    subscribe(events: string): Promise<IEslEvent>;
    addEventHandler(eventName: string, callBack: EslEventCallBack): void;
    removeEventHandler(callBack: EslEventCallBack): void;
    /**
     *
     * @param timeout seconds to wait for linger
     */
    linger(timeout?: number): Promise<IEslEvent>;
    protected _promisify(hangupAware: boolean, ff: (...args: any[]) => void, ...others: any[]): Promise<IEslEvent>;
    disconnect(): void;
}
export declare class EslConnectionFromFs extends EslConnection {
    execute(app: string, args?: string): Promise<IEslEvent>;
    executeEx(app: string, args?: string): Promise<EslEventEx>;
}
export declare class EslConnectionToFs extends EslConnection {
    constructor(conn?: any);
    /**
     *
     * @param ip
     * @param port
     * @param pass
     * @param timeout in seconds
     */
    connect(ip: string, port: number, pass: string, timeout?: number): Promise<unknown>;
    callAndExecute(dialString: string, execString: string): Promise<IEslEvent>;
}
export declare class EslCall extends EslConnectionFromFs {
    constructor(conn: any);
    setVariable(name: string, value: string | boolean | number): Promise<IEslEvent>;
    answer(): Promise<IEslEvent>;
    hangup(cause?: string): Promise<IEslEvent>;
    /**
     *
     * @param path path to play
     * @param seekSamples You can append @@<samples> to the file name to specify a playback start position. This works predictably in PCM files, less predictably with compressed files such as mp3
     */
    playback(path: string, seekSamples?: number): Promise<IEslEvent>;
    playAndGetDigits(min: string | number, max: string | number, tries: string | number, timeout: string | number, terminators: string, file: string, invalid_file?: string, regexp?: string, digit_timeout?: string | number, transfer_on_failure?: string): Promise<EslPGDResult>;
}
export declare class EslCallEx extends EslCall {
    hangedUp: boolean;
    constructor(conn: any);
    execute(app: string, args?: string): Promise<IEslEvent>;
}
export { FsApi, FsCcApi, FsStatusApi } from "./api";
export { ICCAgent, ICCMember, ICCQueue, ICCTier, ICall, IChannel, IShowResult } from "./fstypes";
