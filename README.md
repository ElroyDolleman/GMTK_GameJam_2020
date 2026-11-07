# GMTK_GameJam_2020
GMTK Game Jam 2020 — Out of Control

A Phaser 3 platformer written in TypeScript.

## Requirements

- [Node.js](https://nodejs.org/) 22.18 or newer (the build scripts are TypeScript files run directly by Node)

Only needed to re-export art:
- [Aseprite](https://www.aseprite.org/) CLI
- [TexturePacker](https://www.codeandweb.com/texturepacker) CLI

If either is not on your `PATH`, set `ASEPRITE` / `TEXTUREPACKER` to the full path of the executable.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:8080/. The game recompiles whenever a file in `src/` changes; refresh the page to see it.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Watch-compile the game and serve `dist/` on port 8080 |
| `npm start` | Build once and serve `dist/` |
| `npm run build` | Compile `src/` into `dist/js/game.js` |
| `npm run serve` | Serve `dist/` (`-- --port 3000` to change the port) |
| `npm run typecheck` | Type-check the game and the build scripts |
| `npm run export:commands` | `assets_source/commands.csv` → `dist/assets/commands.json` |
| `npm run export:maps` | Tiled maps in `assets_source/maps/` → `dist/assets/levels.json` (Tiled itself is not required) |
| `npm run export:art` | Aseprite files → PNGs → TexturePacker sheets in `dist/assets/` |
| `npm run export` | Commands + maps |
| `npm run export:all` | Commands + maps + art |

## Project layout

- `src/` — game source (global namespaces, bundled into a single file by `tsc --outFile`)
- `dist/` — the playable game, including the generated assets
- `assets_source/` — Aseprite, Tiled, audio and command source files
- `tools/scripts/` — Node build scripts
