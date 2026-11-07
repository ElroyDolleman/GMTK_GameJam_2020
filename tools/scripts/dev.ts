/**
 * Development mode: recompiles the game on change (tsc --watch) and serves dist/.
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { root } from './common.ts';

const require = createRequire(import.meta.url);
const tscBin = require.resolve('typescript/bin/tsc');

const children = [
    spawn(process.execPath, [tscBin, '--watch', '--preserveWatchOutput', '-p', root], { stdio: 'inherit' }),
    spawn(process.execPath, [path.join(root, 'tools', 'scripts', 'serve.ts'), ...process.argv.slice(2)], { stdio: 'inherit' }),
];

function shutdown(code = 0): void {
    for (const child of children) child.kill();
    process.exit(code);
}

process.on('SIGINT', () => shutdown());
process.on('SIGTERM', () => shutdown());
for (const child of children) child.on('exit', code => shutdown(code ?? 0));
