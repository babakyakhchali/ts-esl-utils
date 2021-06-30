import { CCAgentStatus, ICall, ICCAgent, ICCMember, ICCQueue, ICCTier, IChannel } from "./fstypes";
export declare class FsApi {
    private executor;
    constructor(executeorType: 'ESL' | 'SSH' | 'CMD', conf: IApiExecutorConf);
    init(): Promise<any>;
    executeString(s: string): Promise<string>;
    show<T>(target: string, opts?: string): Promise<T[]>;
    close(): void;
}
interface IApiExecutorConf {
    host?: string;
    sshUsername?: string;
    sshPassword?: string;
    eslPort?: number;
    eslPassword?: string;
}
export declare class FsApiEx {
    private fsapi;
    constructor(fsapi: FsApi);
    getAPI(): FsApi;
    close(): void;
    ccListApi<T>(api: string): Promise<T[]>;
    getQeueueMembers(queue: string): Promise<ICCMember[]>;
    getTiers(): Promise<ICCTier[]>;
    getQueues(): Promise<ICCQueue[]>;
    addAgent(name: string, contact: string, type?: string): Promise<void>;
    getAgents(): Promise<ICCAgent[]>;
    updateAgent(name: string, attr: string, value: string): Promise<void>;
    setAgentStatus(name: string, status: CCAgentStatus): Promise<void>;
    delTier(tier: ICCTier): Promise<void>;
    addTier(tier: ICCTier): Promise<void>;
    setTier(tier: ICCTier, param: 'level' | 'position' | 'state', value: string): Promise<void>;
    reloadTier(tier: ICCTier): Promise<void>;
    status(): Promise<string>;
    getChannels(): Promise<IChannel[]>;
    getCalls(): Promise<ICall[]>;
    killCall(uuid: string): Promise<void>;
    exists(uuid: string): Promise<boolean>;
}
export {};
