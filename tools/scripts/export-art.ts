/**
 * Exports Aseprite files to PNGs and packs them into sprite sheets with TexturePacker.
 *
 *   assets_source/aseprite/animations/<sheet>/*.aseprite  -> one PNG per frame (name_00.png, name_01.png, ...)
 *   assets_source/aseprite/sheets/<sheet>/*.aseprite      -> one PNG per file
 *   -> dist/assets/<sheet>_sheet.png + <sheet>_sheet.json (Phaser atlas format)
 *
 * Requires the Aseprite and TexturePacker CLIs. Set ASEPRITE / TEXTUREPACKER to
 * their full paths if they are not on PATH.
 */
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { assetsSource, distAssets, ensureDir, runTool } from './common.ts';

const asepriteDir = path.join(assetsSource, 'aseprite');
const texturePackerDir = ensureDir(path.join(assetsSource, 'texturepacker'));
ensureDir(distAssets);

function subdirs(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
}

function exportGroup(group: 'animations' | 'sheets', pngFolder: string, frameSuffix: string): void {
    for (const sheet of subdirs(path.join(asepriteDir, group))) {
        const sourceDir = path.join(asepriteDir, group, sheet);
        const pngDir = ensureDir(path.join(texturePackerDir, pngFolder, sheet));

        for (const file of readdirSync(sourceDir).filter(f => f.endsWith('.aseprite'))) {
            const name = path.basename(file, '.aseprite');
            // A number in the output name makes Aseprite write every frame as a numbered sequence
            runTool('ASEPRITE', 'aseprite', ['-b', path.join(sourceDir, file), '--save-as', path.join(pngDir, `${name}${frameSuffix}.png`)]);
        }

        runTool('TEXTUREPACKER', 'TexturePacker', [
            pngDir,
            '--format', 'phaser',
            '--data', path.join(distAssets, `${sheet}_sheet.json`),
            '--sheet', path.join(distAssets, `${sheet}_sheet.png`),
            '--extrude', '0',
            '--force-squared',
            '--disable-rotation',
        ]);
        console.log(`Packed ${sheet}_sheet`);
    }
}

exportGroup('animations', 'animations', '_00');
exportGroup('sheets', 'images', '');
