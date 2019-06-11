import { EslCall, EslServer, IEslEvent } from '../index';


async function onConnection(conn: any) {
    try {
        const call = new EslCall(conn);
        let r = await call.linger();
        await call.subscribe('all');
        conn.on('esl::event::**',(e:IEslEvent)=>{
            console.log(e.getHeader('Event-Name'));
        })
        r = await call.answer();
        await call.setVariable('tts_engine', 'flite');
        await call.setVariable('tts_voice', 'kal');

        //await call.execute('speak', 'Welcom to ariasamane');
        let d = await call.playAndGetDigits(1, 8, 1, 7000, '#', "say:'Welcom to ariasamane.please enter your destination'", "''");
        if (d.getDigits()) {
            await call.execute('bridge', 'user/' + d.getDigits());
        }
        r = await call.hangup();
        return r;
    } catch (error) {
        console.log(error);
    }

}

const server = new EslServer({
    port: 8040,
    host: '0.0.0.0',
    onConnection: onConnection,
    onError: (e) => {
        console.log(e)
    },
    onReady: () => {
        console.log('ready')
    }
});
server.start();