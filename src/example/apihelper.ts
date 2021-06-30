import { FsApi, FsApiEx } from "../api";

const host = '127.0.0.1';
const port = 8021;
const password = 'ClueCon';

export async function runtest() {
    const api = new FsApi('ESL', { host: host, eslPort: port, eslPassword: password });
    await api.init();
    const apiEx = new FsApiEx(api);
    
    console.log(await apiEx.status());
    console.log(await apiEx.getChannels());
    console.log(await apiEx.getCalls())
    console.log(await apiEx.getAgents());
    console.log(await apiEx.getTiers());
    console.log(await apiEx.getQueues());
    api.close();
    process.exit(0);
}

runtest();