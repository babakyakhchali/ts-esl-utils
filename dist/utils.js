"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseCSV(str = '', d = ',') {
    const lines = str.split('\n');
    const result = [];
    const headStr = lines[0];
    if (!headStr || !headStr.includes(d)) {
        return result;
    }
    const colNames = headStr.split(d);
    for (let i = 1; i < lines.length; i++) {
        const lstr = lines[i];
        if (!lstr.includes(d))
            continue;
        let row = {};
        var rowData = lstr.split(d);
        for (var j = 0; j < colNames.length; j++) {
            row[colNames[j]] = rowData[j];
        }
        result.push(row);
    }
    return result;
}
exports.parseCSV = parseCSV;
//# sourceMappingURL=utils.js.map