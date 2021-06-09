import { FsApi, FsCcApi, FsStatusApi } from "../api";

const host = '127.0.0.1';
const port = 8021;
const password = 'ClueCon';

export async function runtest() {
    const api = new FsApi('ESL', { host: host, eslPort: port, eslPassword: password });
    await api.init();
    const cc = new FsCcApi(api);
    const status = new FsStatusApi(api);
    console.log(await status.status());
    console.log(await status.getChannels());
    console.log(await status.getCalls())
    console.log(await cc.getAgents());
    console.log(await cc.getTiers());
    console.log(await cc.getQueues());
    api.close();
    process.exit(0);
}

runtest();