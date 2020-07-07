import { EslConnectionToFs, IEslEvent } from "..";

class Test {
    con: EslConnectionToFs;
    constructor() {
        this.con = new EslConnectionToFs();
    }
    async listen() {
        await this.con.connect('127.0.0.1', 8021, 'ClueCon', 3);
        await this.con.subscribe('CHANNEL_CREATE CHANNEL_HANGUP CHANNEL_ANSWERED CHANNEL_PROGRESS CUSTOM conference::maintenance');
        await this.con.addEventHandler('esl::event::CHANNEL_HANGUP::*', this.onEvent.bind(this));
        await this.con.addEventHandler('esl::event::CHANNEL_ANSWERED::*', this.onEvent.bind(this));
        await this.con.addEventHandler('esl::event::CHANNEL_CREATE::*', this.onEvent.bind(this));
        await this.con.addEventHandler('esl::event::CUSTOM::*', this.onEvent.bind(this));
    }
    onEvent(e:IEslEvent){
        console.log(e.getHeader('Event-Name'));
    }
}

const t = new Test
t.listen().catch(e=>console.error('error connecting',e))