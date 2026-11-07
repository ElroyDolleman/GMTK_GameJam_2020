/**
 * Converts assets_source/commands.csv into dist/assets/commands.json.
 *
 * CSV format (semicolon separated):
 *   levelname;level01
 *   jump;1000
 *   rocket;600
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { assetsSource, distAssets, ensureDir } from './common.ts';

interface Command {
    name: string;
    time: number;
}

const csv = readFileSync(path.join(assetsSource, 'commands.csv'), 'utf8').replace(/^﻿/, '');
const output: Record<string, Command[]> = {};
let current: Command[] | undefined;

for (const rawLine of csv.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line.includes(';')) continue;

    const [name, value] = line.split(';');
    if (name === 'levelname') {
        current = output[value] = [];
    } else if (current) {
        current.push({ name, time: parseInt(value, 10) });
    } else {
        throw new Error(`Command "${line}" appears before any "levelname" line`);
    }
}

const outFile = path.join(ensureDir(distAssets), 'commands.json');
writeFileSync(outFile, JSON.stringify(output));
console.log(`Wrote ${Object.keys(output).length} levels to ${path.relative(process.cwd(), outFile)}`);
