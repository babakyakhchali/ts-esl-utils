"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const xml2js_1 = require("xml2js");
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
    close() {
        this.executor.close();
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
    close() {
        this.esl.conn.disconnect();
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
    close() {
        throw new Error("Method not implemented.");
    }
    init() {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr) {
        throw new Error("Method not implemented.");
    }
}
class CmdApiExecutor {
    close() {
        throw new Error("Method not implemented.");
    }
    init() {
        throw new Error("Method not implemented.");
    }
    executeString(_apistr) {
        throw new Error("Method not implemented.");
    }
}
class FsApiEx {
    constructor(fsapi) {
        this.fsapi = fsapi;
    }
    getAPI() {
        return this.fsapi;
    }
    close() {
        this.fsapi.close();
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
        return this.updateAgent(name, 'contact', contact);
    }
    async getAgents() {
        return this.ccListApi('callcenter_config agent list');
    }
    async updateAgent(name, attr, value) {
        const r = await this.fsapi.executeString(`callcenter_config agent set ${attr} ${name} '${value}'`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "UpdateAgentError";
        }
        return r;
    }
    async setAgentStatus(name, status) {
        return this.updateAgent(name, 'status', status);
    }
    async delTier(tier) {
        const r = await this.fsapi.executeString(`callcenter_config tier del ${tier.queue} ${tier.agent}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "TierError";
        }
    }
    async addTier(tier) {
        const r = await this.fsapi.executeString(`callcenter_config tier add ${tier.queue} ${tier.agent} ${tier.level || 1} ${tier.position || 1}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "TierError";
        }
    }
    async setTier(tier, param, value) {
        const r = await this.fsapi.executeString(`callcenter_config tier set ${param} ${tier.queue} ${tier.agent} ${value}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "TierError";
        }
    }
    async reloadTier(tier) {
        const r = await this.fsapi.executeString(`callcenter_config tier reload ${tier.queue} ${tier.agent}`);
        if (!r.trimRight().endsWith('+OK')) {
            console.error(r);
            throw "TierError";
        }
    }
    async status() {
        return this.fsapi.executeString('status');
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
    async sofiaStatus() {
        const r = await this.fsapi.executeString('sofia xmlstatus');
        if (r.startsWith('-ERR sofia Command not found!')) {
            throw new Error("ModuleNotLoaded");
        }
        const j = await xml2js_1.parseStringPromise(r, { explicitArray: false });
        if (j.profiles && j.profiles.profile) {
            return j.profiles.profile;
        }
        return [];
    }
    async sofiaProfileStatus(profile) {
        const r = await this.fsapi.executeString(`sofia xmlstatus profile ${profile}`);
        if (r.startsWith('-ERR sofia Command not found!')) {
            throw new Error("ModuleNotLoaded");
        }
        if (r.startsWith('Invalid Profile')) {
            throw new Error("SofiaProfileNotLoaded");
        }
        const j = await xml2js_1.parseStringPromise(r, { explicitArray: false });
        return j.profile["profile-info"];
    }
    async sofiaProfileRegStatus(profile) {
        const r = await this.fsapi.executeString(`sofia xmlstatus profile ${profile} reg`);
        if (r.startsWith('-ERR sofia Command not found!')) {
            throw new Error("ModuleNotLoaded");
        }
        if (r.startsWith('Invalid Profile')) {
            throw new Error("SofiaProfileNotLoaded");
        }
        const j = await xml2js_1.parseStringPromise(r, { explicitArray: false, trim: true });
        if (typeof j === 'string') {
            return [];
        }
        else if (j.profile.registration) {
            return [j.profile.registration];
        }
        else {
            return j.profile.registrations.registration;
        }
    }
}
exports.FsApiEx = FsApiEx;
//# sourceMappingURL=api.js.map