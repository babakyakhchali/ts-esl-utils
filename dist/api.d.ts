import { CCAgentStatus, ICall, ICCAgent, ICCMember, ICCQueue, ICCTier, IChannel, ISofiaProfileStatus, ISofiaRegistrationStatus, ISofiaStatusItem, IShowResult, IListUsersItem } from "./fstypes";
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
    addAgent(name: string, contact: string, type?: string): Promise<string>;
    getAgents(): Promise<ICCAgent[]>;
    updateAgent(name: string, attr: string, value: string): Promise<string>;
    setAgentStatus(name: string, status: CCAgentStatus): Promise<string>;
    delTier(tier: ICCTier): Promise<void>;
    addTier(tier: ICCTier): Promise<void>;
    setTier(tier: ICCTier, param: 'level' | 'position' | 'state', value: string): Promise<void>;
    reloadTier(tier: ICCTier): Promise<void>;
    status(): Promise<string>;
    getChannels(): Promise<IChannel[]>;
    getCalls(): Promise<ICall[]>;
    showJSON<T>(query: string): Promise<IShowResult<T>>;
    killCall(uuid: string): Promise<void>;
    exists(uuid: string): Promise<boolean>;
    sofiaStatus(): Promise<ISofiaStatusItem[]>;
    sofiaProfileStatus(profile: string): Promise<ISofiaProfileStatus>;
    sofiaProfileRegStatus(profile: string): Promise<ISofiaRegistrationStatus[]>;
    listUsers(group?: string, domain?: string, user?: string, context?: string): Promise<IListUsersItem[]>;
}
export {};
