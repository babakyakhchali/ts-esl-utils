"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function computeDuration(cdr) {
    const bridges = extractBridges(cdr);
    const d = bridges.reduce((p, c) => { return p + Math.floor((c.stop - c.start) / 1000000); }, 0);
    return d;
}
exports.computeDuration = computeDuration;
function extractBridges(cdr) {
    const result = [];
    for (const cf of cdr.callflow) {
        if (cf.caller_profile.originatee
            && cf.caller_profile.originatee.originatee_caller_profiles
            && cf.caller_profile.originatee.originatee_caller_profiles.length > 0) {
            let leg = cf.caller_profile.originatee.originatee_caller_profiles[0];
            if (!parseInt(cf.times.bridged_time)) {
                continue;
            }
            let b = {
                ani: cf.caller_profile.ani,
                destination_number: leg.destination_number,
                start: parseInt(cf.times.bridged_time),
                stop: parseInt(cf.times.transfer_time) || parseInt(cf.times.hangup_time)
            };
            result.push(b);
        }
    }
    return result;
}
exports.extractBridges = extractBridges;
//# sourceMappingURL=cdr.js.map