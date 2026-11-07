import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const assetsSource = path.join(root, 'assets_source');
export const distDir = path.join(root, 'dist');
export const distAssets = path.join(distDir, 'assets');

export function ensureDir(dir: string): string {
    mkdirSync(dir, { recursive: true });
    return dir;
}

/** Reads an XML attribute from a tag string, e.g. attr('<a x="1"/>', 'x') === '1'. */
export function attr(tag: string, name: string): string | undefined {
    return new RegExp(`\\s${name}="([^"]*)"`).exec(tag)?.[1];
}

/**
 * Runs an external tool (Aseprite, TexturePacker, ...). The executable can be
 * overridden with an environment variable, e.g. ASEPRITE="C:/path/Aseprite.exe".
 */
export function runTool(envVar: string, defaultExe: string, args: string[]): void {
    const exe = process.env[envVar] ?? defaultExe;
    const result = spawnSync(exe, args, { stdio: 'inherit' });
    if (result.error) {
        if ((result.error as NodeJS.ErrnoException).code === 'ENOENT') {
            console.error(`Could not find "${exe}". Install it, add it to PATH, or set ${envVar} to its full path.`);
            process.exit(1);
        }
        throw result.error;
    }
    if (result.status !== 0) {
        console.error(`"${exe} ${args.join(' ')}" exited with code ${result.status}`);
        process.exit(result.status ?? 1);
    }
}
