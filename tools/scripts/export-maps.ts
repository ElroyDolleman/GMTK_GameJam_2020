/**
 * Reads the Tiled maps (assets_source/maps/*.tmx) and their tilesets (*.tsx)
 * and writes a single dist/assets/levels.json containing all level data.
 *
 * The .tmx/.tsx files are parsed directly, so Tiled itself is not needed.
 * Tile layers must use CSV encoding (the Tiled default).
 */
import { copyFileSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { assetsSource, attr, distAssets, ensureDir } from './common.ts';

interface Point { x: number; y: number; }
interface Fan extends Point { rotation: number; }
interface Hitbox { x?: number; y?: number; width?: number; height?: number; }

interface TilesetData {
    customHitboxes: Record<string, Hitbox>;
    tiletypes: Record<string, number[]>;
}

interface LevelData {
    fans: Fan[];
    player_spawn?: Point;
    goal?: Point;
    gridCellsX: number;
    gridCellsY: number;
    tiles: number[];
    tileset_name: string;
}

const mapsDir = path.join(assetsSource, 'maps');
ensureDir(distAssets);

const hitboxProps: Record<string, keyof Hitbox> = {
    hitbox_x: 'x',
    hitbox_y: 'y',
    hitbox_width: 'width',
    hitbox_height: 'height',
};

function parseTileset(tsxPath: string): TilesetData {
    const xml = readFileSync(tsxPath, 'utf8');

    // Copy the tileset image next to the game
    const imageTag = /<image\b[^>]*>/.exec(xml)?.[0];
    const imageSource = imageTag && attr(imageTag, 'source');
    if (imageSource) {
        const imagePath = path.resolve(path.dirname(tsxPath), imageSource);
        copyFileSync(imagePath, path.join(distAssets, path.basename(imagePath)));
    }

    const customHitboxes: Record<string, Hitbox> = {};
    const tiletypes: Record<string, number[]> = {};

    for (const tile of xml.matchAll(/<tile\s+id="(\d+)"[^>]*>([\s\S]*?)<\/tile>/g)) {
        const tileId = parseInt(tile[1], 10);
        for (const [prop] of tile[2].matchAll(/<property\b[^>]*\/>/g)) {
            const name = attr(prop, 'name') ?? '';
            const value = attr(prop, 'value') ?? '';

            if (name === 'TileType') {
                if (value.length > 0) (tiletypes[value] ??= []).push(tileId);
            } else if (name in hitboxProps) {
                (customHitboxes[tileId] ??= {})[hitboxProps[name]] = parseInt(value, 10);
            }
        }
    }

    return { customHitboxes, tiletypes };
}

function parseMap(tmxPath: string, tilesets: Record<string, TilesetData>): LevelData {
    const xml = readFileSync(tmxPath, 'utf8');
    const mapTag = /<map\b[^>]*>/.exec(xml)![0];

    const tilesetTag = /<tileset\b[^>]*>/.exec(xml)![0];
    const tilesetSource = attr(tilesetTag, 'source')!;
    const tilesetName = path.basename(tilesetSource, '.tsx');
    tilesets[tilesetName] ??= parseTileset(path.resolve(path.dirname(tmxPath), tilesetSource));

    const data = /<data encoding="csv">([\s\S]*?)<\/data>/.exec(xml);
    if (!data) throw new Error(`${tmxPath}: first tile layer must use CSV encoding`);
    const tiles = data[1].split(',').map(s => s.trim()).filter(Boolean).map(s => parseInt(s, 10) - 1);

    let playerSpawn: Point | undefined;
    let goal: Point | undefined;
    const fans: Fan[] = [];

    for (const [tag] of xml.matchAll(/<object\b[^>]*>/g)) {
        const point = { x: Number(attr(tag, 'x') ?? 0), y: Number(attr(tag, 'y') ?? 0) };
        switch (attr(tag, 'name')) {
            case 'player_spawn': playerSpawn = point; break;
            case 'goal': goal = point; break;
            case 'fan': fans.push({ ...point, rotation: Number(attr(tag, 'rotation') ?? 0) }); break;
        }
    }

    return {
        fans,
        player_spawn: playerSpawn,
        goal,
        gridCellsX: parseInt(attr(mapTag, 'width')!, 10),
        gridCellsY: parseInt(attr(mapTag, 'height')!, 10),
        tiles,
        tileset_name: tilesetName,
    };
}

const output: Record<string, unknown> = {};
const tilesets: Record<string, TilesetData> = {};
const mapFiles = readdirSync(mapsDir).filter(f => f.endsWith('.tmx')).sort();

for (const file of mapFiles) {
    output[path.basename(file, '.tmx')] = parseMap(path.join(mapsDir, file), tilesets);
}
output.tilesets_data = tilesets;

const outFile = path.join(distAssets, 'levels.json');
writeFileSync(outFile, JSON.stringify(output));
console.log(`Wrote ${mapFiles.length} levels to ${path.relative(process.cwd(), outFile)}`);
