/**
 * Minimal static file server for dist/ with caching disabled.
 * Usage: node tools/scripts/serve.ts [--port 8080]
 */
import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { distDir } from './common.ts';

const portArg = process.argv.indexOf('--port');
const port = Number(portArg >= 0 ? process.argv[portArg + 1] : process.env.PORT ?? 8080);

const mimeTypes: Record<string, string> = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.map': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.ogg': 'audio/ogg',
    '.ico': 'image/x-icon',
};

const server = createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
    let filePath = path.join(distDir, path.normalize(urlPath));

    if (!filePath.startsWith(distDir)) {
        res.writeHead(403).end('Forbidden');
        return;
    }

    try {
        if (statSync(filePath).isDirectory()) filePath = path.join(filePath, 'index.html');
        const size = statSync(filePath).size;
        res.writeHead(200, {
            'Content-Type': mimeTypes[path.extname(filePath).toLowerCase()] ?? 'application/octet-stream',
            'Content-Length': size,
            'Cache-Control': 'no-store',
        });
        createReadStream(filePath).pipe(res);
    } catch {
        res.writeHead(404).end('Not found');
    }
});

server.listen(port, () => {
    console.log(`Serving dist/ at http://localhost:${port}/`);
});
