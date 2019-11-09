import { createServer, IncomingMessage, ServerResponse } from "http";

import { parse } from "url";
import { join, extname } from "path";
import { statSync, createReadStream, existsSync } from "fs";
let baseDir = process.env.HTTP_SND_DIR || join(__dirname, '../');
async function handler(request: IncomingMessage, response: ServerResponse) {
    try {
        let filePath;
        if (request.url) {
            const url = parse(request.url, true);
            if (url.pathname) {
                filePath = join(baseDir, url.pathname);                
                if (!existsSync(filePath)) {
                    response.writeHead(404, 'file not found:' + (filePath || 'NA'));
                    response.end();
                    return;
                }
                let ext = extname(filePath);
                let stat = statSync(filePath);
                if(stat.isDirectory()){
                    response.writeHead(400, 'can not serve direcotory!!');
                    response.end();
                    return;
                }
                response.writeHead(200, {
                    'Content-Type': ext == 'mp3' ? 'audio/mpeg' : 'audio/wav',
                    'Content-Length': stat.size
                });
                console.log('servin',filePath);
                createReadStream(filePath).pipe(response);
                return
            } else {
                response.writeHead(400, 'no pathname in url');
                response.end();
            }
        }
    } catch (error) {
        response.writeHead(500, error);
        response.end();
    }

}

export function createHttpSndServer(port?:number,dir?:string) {
    baseDir = dir||baseDir;
    port = port || parseInt(process.env.HTTP_FILE_PORT || '2030');
    createServer(handler).listen(port, () => {
        console.log('starting to serve audio files on:', port, ' dir:', baseDir);
    });
}
