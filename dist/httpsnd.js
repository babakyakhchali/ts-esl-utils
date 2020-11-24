"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const url_1 = require("url");
const path_1 = require("path");
const fs_1 = require("fs");
let baseDir = process.env.HTTP_SND_DIR || path_1.join(__dirname, '../');
async function handler(request, response) {
    try {
        let filePath;
        if (request.url) {
            const url = url_1.parse(request.url, true);
            if (url.pathname) {
                filePath = path_1.join(baseDir, url.pathname);
                if (!fs_1.existsSync(filePath)) {
                    response.writeHead(404, 'file not found:' + (filePath || 'NA'));
                    response.end();
                    return;
                }
                let ext = path_1.extname(filePath);
                let stat = fs_1.statSync(filePath);
                if (stat.isDirectory()) {
                    response.writeHead(400, 'can not serve direcotory!!');
                    response.end();
                    return;
                }
                response.writeHead(200, {
                    'Content-Type': ext == 'mp3' ? 'audio/mpeg' : 'audio/wav',
                    'Content-Length': stat.size
                });
                console.log('servin', filePath);
                fs_1.createReadStream(filePath).pipe(response);
                return;
            }
            else {
                response.writeHead(400, 'no pathname in url');
                response.end();
            }
        }
    }
    catch (error) {
        response.writeHead(500, error);
        response.end();
    }
}
function createHttpSndServer(port, dir) {
    baseDir = dir || baseDir;
    port = port || parseInt(process.env.HTTP_FILE_PORT || '2030');
    http_1.createServer(handler).listen(port, () => {
        console.log('starting to serve audio files on:', port, ' dir:', baseDir);
    });
}
exports.createHttpSndServer = createHttpSndServer;
//# sourceMappingURL=httpsnd.js.map