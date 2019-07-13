import { EslCallEx, EslServer, IEslEvent } from '../index';


async function onConnection(conn: any) {
    const call = new EslCallEx(conn);
    try {        
        let r = await call.linger();
        await call.subscribe('all');
        let cc=0;
        conn.on('esl::event::**', (e: IEslEvent) => {
            let name = e.getHeader('Event-Name');
            if(name == null){
                console.log('shit');
            }
            console.log(cc++,name);
        })
        r = await call.answer();
        await call.setVariable('tts_engine', 'flite');
        await call.setVariable('tts_voice', 'kal');

        //await call.execute('speak', 'Welcom to ariasamane');
        for (let i = 0; i < 3; i++) {
            let d = await call.playAndGetDigits(1, 8, 1, 7000, '#', "say:'Welcom to ariasamane.please enter your destination'", "''");
            if (d.getDigits()) {
                //await call.execute('bridge', 'user/' + d.getDigits());
                console.log(d.getDigits());
            }
        }

        r = await call.hangup();
        return r;
    } catch (error) {
        console.log(error);
    }finally{
        call.disconnect();
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