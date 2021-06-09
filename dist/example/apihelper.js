"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("../api");
const host = '127.0.0.1';
const port = 8021;
const password = 'ClueCon';
async function runtest() {
    const api = new api_1.FsApi('ESL', { host: host, eslPort: port, eslPassword: password });
    await api.init();
    const cc = new api_1.FsCcApi(api);
    const status = new api_1.FsStatusApi(api);
    console.log(await status.getChannels());
    console.log(await status.getCalls());
    console.log(await cc.getAgents());
    console.log(await cc.getTiers());
    console.log(await cc.getQueues());
}
exports.runtest = runtest;
runtest();
//# sourceMappingURL=apihelper.js.map