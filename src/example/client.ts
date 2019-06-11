import { EslConnectionToFs } from "..";

const con = new EslConnectionToFs();
con.connect('127.0.0.1', 8021, 'ClueCon', 3).then(
    async () => {
        let r = await con.api('version');
        console.log(r.getBody());
        r = await con.bgapi('show','channels');
        console.log(r.getBody());
    }
).catch(e => {
    console.error(e);
})