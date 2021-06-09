"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const utils_1 = require("./utils");
class FsApi {
    constructor(executeorType, conf) {
        if (executeorType == 'ESL') {
            this.executor = new EslApiExecutor(conf);
        }
        else if (executeorType == 'SSH') {
            this.executor = new SshApiExecutor();
        }
        else if (executeorType == 'CMD') {
            this.executor = new CmdApiExecutor();
        }
        else {
            throw 'InvalidExecutorType';
        }
    }
    init() {
        return this.executor.init();
    }
    executeString(s) {
        return this.executor.executeString(s);
    }
    async show(target, opts) {
        const s = await this.executor.executeString('show ' + target + (opts || ''));
        return utils_1.parseCSV(s);
    }
}
exports.FsApi = FsApi;
class EslApiExecutor {
    constructor(conf) {
        this.conf = conf;
        if (!conf || !conf.host || !conf.eslPort || !conf.eslPassword) {
            throw 'EslExecutorConfInvalid';
        }
        this.esl = new _1.EslConnectionToFs();
    }
    async init() {
        return this.esl.connect(this.conf.host, this.conf.eslPort, this.conf.eslPassword, 10);
    }
    async executeString(apistr) {
        const r = await this.esl.api(apistr);
        return r.getBody();
    }
}
class SshApiExecutor {
    init() {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr) {
        throw new Error("Method not implemented.");
    }
}
class CmdApiExecutor {
    init() {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr) {
        throw new Error("Method not implemented.");
    }
}
class FsCcApi {
    constructor(fsapi) {
        this.fsapi = fsapi;
    }
    async ccListApi(api) {
        const r = await this.fsapi.executeString(api);
        if (!r.trim().endsWith('+OK')) {
            return [];
        }
        return utils_1.parseCSV(r, '|');
    }
    getQeueueMembers(queue) {
        return this.ccListApi(`callcenter_config queue list members ${queue}`);
    }
    getTiers() {
        return this.ccListApi('callcenter_config tier list');
    }
    getQueues() {
        return this.ccListApi('callcenter_config queue list');
    }
    async addAgent(name, contact, type = 'callback') {
        let r = await this.fsapi.executeString(`callcenter_config agent add ${name} ${type}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "AddAgentError";
        }
        this.updateAgent(name, 'contact', contact);
    }
    async getAgents() {
        return this.ccListApi('callcenter_config agent list');
    }
    async updateAgent(name, attr, value) {
        const r = await this.fsapi.executeString(`callcenter_config agent set status ${name} ${attr} ${value}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "UpdateAgentError";
        }
    }
    async setAgentStatus(name, status) {
        this.updateAgent(name, 'status', status);
    }
}
exports.FsCcApi = FsCcApi;
class FsStatusApi {
    constructor(fsapi) {
        this.fsapi = fsapi;
    }
    async getChannels() {
        return this.fsapi.show('channels');
    }
    async getCalls() {
        return this.fsapi.show('calls');
    }
    async killCall(uuid) {
        const r = await this.fsapi.executeString(`uuid_kill ${uuid}`);
        if (!r.toLocaleLowerCase().includes('ok')) {
            throw 'CallNotFound';
        }
    }
    async exists(uuid) {
        const r = await this.fsapi.executeString(`uuid_exists ${uuid}`);
        return r == 'true';
    }
}
exports.FsStatusApi = FsStatusApi;
//# sourceMappingURL=api.js.map