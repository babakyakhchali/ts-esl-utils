"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const host = '127.0.0.1';
const port = 8021;
const password = 'ClueCon';
async function runtest() {
    const api = new api_1.FsApi('ESL', { host: host, eslPort: port, eslPassword: password });
    await api.init();
    const apiEx = new api_1.FsApiEx(api);
    console.log(await apiEx.status());
    console.log(await apiEx.getChannels());
    console.log(await apiEx.getCalls());
    console.log(await apiEx.getAgents());
    console.log(await apiEx.getTiers());
    console.log(await apiEx.getQueues());
    console.log(await apiEx.sofiaStatus());
    console.log(await apiEx.sofiaProfileStatus('internal'));
    console.log(await apiEx.sofiaProfileRegStatus('internal-local'));
    console.log(await apiEx.showJSON('registrations'));
    api.close();
    process.exit(0);
}
exports.runtest = runtest;
runtest();
//# sourceMappingURL=apihelper.js.map