"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isError(r) {
    return r.body && r.body.substr(0, 4).toLowerCase() == '-err';
}
exports.isError = isError;
class EslEventEx {
    constructor(event) {
        this.event = event;
    }
    getType() {
        return this.event.getType();
    }
    getHeader(hdr) {
        return this.event.getHeader(hdr);
    }
    getBody() {
        return this.event.getBody();
    }
    getVar(name) {
        return this.getHeader(`variable_${name}`);
    }
    serialize(format) {
        return this.event.serialize(format);
    }
}
exports.EslEventEx = EslEventEx;
class EslPGDResult extends EslEventEx {
    getDigits() {
        return this.getVar('esl_last_input');
    }
}
exports.EslPGDResult = EslPGDResult;
class EslServer {
    constructor(opts) {
        this.opts = opts;
    }
    start() {
        const esl = require('modesl');
        let eslServer = new esl.Server({
            port: this.opts.port,
            host: this.opts.host,
            myevents: true
        }, this.opts.onReady);
        eslServer.on('error', this.opts.onError);
        eslServer.on('connection::ready', this.opts.onConnection);
    }
}
exports.EslServer = EslServer;
class EslConnection {
    constructor(conn) {
        this.conn = conn;
    }
    async api(command, args) {
        return this._promisify(false, this.conn.api, command, args);
    }
    async bgapi(command, args) {
        return this._promisify(false, this.conn.bgapi, command, args);
    }
    // async api(command: string, args?: string, bg?: boolean): Promise<ICmdResult> { //todo it is fucked on error
    //     args = args || '';
    //     bg = bg || false;
    //     return new Promise((res, rej) => {
    //         this.conn.on('error', rej);
    //         this.conn.on('esl::end', rej);
    //         let apiFunc = this.conn.api.bind(this.conn);
    //         if (bg) {
    //             apiFunc = this.conn.bgapi.bind(this.conn);
    //         }
    //         apiFunc(command, args, (r: any) => {
    //             this.conn.off('error', rej);
    //             this.conn.off('esl::end', rej);
    //             res(r);
    //         });
    //     });
    // }
    getInfo() {
        return this.conn.getInfo();
    }
    subscribe(events) {
        return this._promisify(false, this.conn.subscribe, events);
    }
    addEventHandler(eventName, callBack) {
        this.conn.on(eventName, callBack);
    }
    removeEventHandler(callBack) {
        this.conn.off(callBack);
    }
    /**
     *
     * @param timeout seconds to wait for linger
     */
    linger(timeout) {
        return this._promisify(false, this.conn.sendRecv, timeout ? 'linger ' + timeout : 'linger');
    }
    _promisify(hangupAware, ff, ...others) {
        others = others || [];
        const self = this;
        return new Promise((res, rej) => {
            const cb = function (r) {
                self.conn.off('error', rejcb);
                self.conn.off('esl::end', rejcb);
                res(r);
            };
            const rejcb = function (e) {
                self.conn.off('error', rejcb);
                self.conn.off('esl::end', rejcb);
                if (hangupAware) {
                    self.conn.off('esl::event::CHANNEL_HANGUP::**', rejcb);
                }
                rej(e);
            };
            cb.bind(this);
            rejcb.bind(this);
            others.push(cb);
            ff.apply(this.conn, others);
            this.conn.on('error', rejcb);
            this.conn.on('esl::end', rejcb);
            if (hangupAware) {
                this.conn.on('esl::event::CHANNEL_HANGUP::**', rejcb);
            }
        });
    }
    disconnect() {
        this.conn.disconnect();
    }
}
class EslConnectionFromFs extends EslConnection {
    execute(app, args) {
        return this._promisify(true, this.conn.execute, app, args);
    }
    async executeEx(app, args) {
        return new EslEventEx(await this.execute(app, args));
    }
}
exports.EslConnectionFromFs = EslConnectionFromFs;
class EslConnectionToFs extends EslConnection {
    constructor(conn) {
        super(conn);
    }
    /**
     *
     * @param ip
     * @param port
     * @param pass
     * @param timeout in seconds
     */
    connect(ip, port, pass, timeout) {
        const esl = require('modesl');
        return new Promise((res, rej) => {
            timeout = timeout || 7;
            this.conn = new esl.Connection(ip, port, pass, () => {
                res(this.conn); //TODO: change this to 'this'
                this.conn.off('error', rej);
                this.conn.off('esl::end', rej);
                clearTimeout(st);
            });
            this.conn.on('error', rej);
            this.conn.on('esl::end', rej);
            const st = setTimeout(() => {
                if (this.conn.socket) {
                    this.conn.socket.destroy('timeout');
                }
            }, timeout * 1000);
        });
    }
    callAndExecute(dialString, execString) {
        return this.bgapi('originate', `${dialString} ${execString}`);
    }
}
exports.EslConnectionToFs = EslConnectionToFs;
class EslCall extends EslConnectionFromFs {
    constructor(conn) {
        super(conn);
    }
    setVariable(name, value) {
        return this.execute('set', `${name}=${value}`);
    }
    answer() {
        return this.execute('answer');
    }
    hangup(cause = 'NORMAL_CLEARING') {
        return this.execute('hangup', cause);
    }
    /**
     *
     * @param path path to play
     * @param seekSamples You can append @@<samples> to the file name to specify a playback start position. This works predictably in PCM files, less predictably with compressed files such as mp3
     */
    playback(path, seekSamples) {
        return this.execute('playback', path + (seekSamples ? `@@${seekSamples}` : ''));
    }
    async playAndGetDigits(min, max, tries, timeout, terminators, file, invalid_file, regexp, digit_timeout, transfer_on_failure) {
        let r = await this.execute('play_and_get_digits', `${min} ${max} ${tries} ${timeout} ${terminators} ${file} ` +
            ` ${invalid_file || "''"} esl_last_input ${regexp || ''} ${digit_timeout || ''} ${transfer_on_failure || ''}`);
        return new EslPGDResult(r);
    }
}
exports.EslCall = EslCall;
class EslCallEx extends EslCall {
    constructor(conn) {
        super(conn);
        this.hangedUp = false;
        conn.on('esl::event::CHANNEL_HANGUP::**', () => {
            this.hangedUp = true;
        });
    }
    execute(app, args) {
        if (this.hangedUp) {
            throw 'AlreadyHanggedUp';
        }
        return super.execute(app, args);
    }
}
exports.EslCallEx = EslCallEx;
//# sourceMappingURL=index.js.map