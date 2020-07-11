class GameScene extends Phaser.Scene {
    init() {
        this.levelLoader = new LevelLoader(this);
    }
    preload() {
        this.load.atlas('player', 'assets/player.png', 'assets/player.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }
    create() {
        this.levelLoader.init();
        this.currentLevel = this.levelLoader.create('level01');
        this.player = new Player(this, this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);
        this.player.speed.x = 24;
    }
    update(time, delta) {
        this.player.update();
        this.currentLevel.collisionManager.moveActor(this.player);
        this.player.lateUpdate();
    }
    destroy() {
        this.currentLevel.destroy();
    }
}
/// <reference path="scenes/game_scene.ts"/>
let config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scaleMode: 3,
    pixelArt: true,
    backgroundColor: '#5d5bff',
    title: "GMTK Game Jam 2020",
    version: "0.0.0",
    disableContextMenu: true,
    scene: [GameScene],
    fps: {
        target: 60,
        min: 60,
        forceSetTimeOut: true
    },
};
let game = new Phaser.Game(config);
class CollisionResult {
    constructor() {
        this.onTop = false;
        this.onLeft = false;
        this.onRight = false;
        this.onBottom = false;
        this.tiles = [];
        this.prevTop = 0;
        this.prevLeft = 0;
        this.prevRight = 0;
        this.prevBottom = 0;
        this.isCrushed = false;
        this.isDamaged = false;
    }
}
class CollisionManager {
    constructor(level) {
        this.currentLevel = level;
    }
    moveActor(actor) {
        let result = new CollisionResult();
        let tiles = this.currentLevel.map.getTilesFromRect(actor.nextHitbox, 2);
        result.prevTop = actor.hitbox.top;
        result.prevLeft = actor.hitbox.left;
        result.prevRight = actor.hitbox.right;
        result.prevBottom = actor.hitbox.bottom;
        actor.moveX();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], actor)) {
                continue;
            }
            if (tiles[i].tiletype == TileType.Solid) {
                this.solveHorizontalCollision(tiles[i], actor, result);
            }
        }
        actor.moveY();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], actor)) {
                continue;
            }
            if (tiles[i].tiletype == TileType.Solid) {
                this.solveVerticalCollision(tiles[i], actor, result);
            }
        }
        return result;
    }
    overlapsNonEmptyTile(tile, actor) {
        return tile.tiletype != TileType.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, actor.hitbox);
    }
    solveHorizontalCollision(tile, actor, result) {
        if (actor.speed.x > 0) {
            result.onRight = true;
            actor.hitbox.x = tile.hitbox.x - actor.hitbox.width;
        }
        else if (actor.speed.x < 0) {
            result.onLeft = true;
            actor.hitbox.x = tile.hitbox.right;
        }
    }
    solveVerticalCollision(tile, actor, result) {
        if (actor.speed.y > 0) {
            result.onBottom = true;
            actor.hitbox.y = tile.hitbox.y - actor.hitbox.height;
        }
        else if (actor.speed.y < 0) {
            result.onTop = true;
            actor.hitbox.y = tile.hitbox.bottom;
        }
    }
}
class ScreenTransition {
}
class Actor {
    constructor(hitbox) {
        this.speed = new Phaser.Math.Vector2();
        this._hitbox = hitbox;
    }
    get position() {
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }
    get x() { return this._hitbox.x; }
    get y() { return this._hitbox.y; }
    set x(x) { this._hitbox.x = x; }
    set y(y) { this._hitbox.y = y; }
    get hitbox() {
        return this._hitbox;
    }
    get nextHitbox() {
        return new Phaser.Geom.Rectangle(this.x + this.speed.x * GameTime.getElapsed(), this.y + this.speed.y * GameTime.getElapsed(), this.hitbox.width, this.hitbox.height);
    }
    update() {
    }
    moveX() {
        this._hitbox.x += this.speed.x * GameTime.getElapsed();
    }
    moveY() {
        this._hitbox.y += this.speed.y * GameTime.getElapsed();
    }
}
class Animator {
    constructor(scene, sprite, actor) {
        this.currentSquish = { timer: 0, startTime: 0, reverseTime: 0, scaleX: 1, scaleY: 1 };
        this.scene = scene;
        this.sprite = sprite;
        this.actor = actor;
    }
    get facingDirection() { return this.sprite.flipX ? -1 : 1; }
    set facingDirection(dir) { this.sprite.flipX = dir < 0; }
    get isSquishing() { return this.currentSquish.timer > 0; }
    update() {
        if (this.isSquishing) {
            this.updateSquish();
        }
    }
    updatePosition() {
        this.sprite.setPosition(this.actor.hitbox.centerX, this.actor.hitbox.centerY);
    }
    changeAnimation(key, isSingleFrame = false) {
        if (isSingleFrame) {
            this.sprite.anims.stop();
            this.sprite.setFrame(key);
        }
        else {
            this.sprite.play(key);
            this.setTimeScale(1);
        }
    }
    setTimeScale(timeScale) {
        this.sprite.anims.setTimeScale(timeScale);
    }
    createAnimation(key, texture, prefix, length, frameRate = 16, repeat = -1) {
        let frameNames = this.scene.anims.generateFrameNames(texture, {
            prefix: prefix,
            suffix: '.png',
            end: length - 1,
            zeroPad: 2
        });
        this.scene.anims.create({
            key: key,
            frames: frameNames,
            frameRate: frameRate,
            repeat: repeat,
        });
    }
    squish(scaleX, scaleY, duration, reverseTime) {
        this.currentSquish = {
            timer: duration,
            reverseTime: reverseTime == undefined ? duration / 2 : reverseTime,
            startTime: duration,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }
    updateSquish() {
        this.currentSquish.timer = Math.max(this.currentSquish.timer - GameTime.getElapsedMS(), 0);
        let timeToReverse = this.currentSquish.startTime - this.currentSquish.reverseTime;
        if (this.currentSquish.timer > timeToReverse) {
            let t = 1 - (this.currentSquish.timer - timeToReverse) / this.currentSquish.reverseTime;
            this.sprite.scaleX = Phaser.Math.Linear(1, this.currentSquish.scaleX, t);
            this.sprite.scaleY = Phaser.Math.Linear(1, this.currentSquish.scaleY, t);
        }
        else {
            let t = 1 - this.currentSquish.timer / timeToReverse;
            this.sprite.scaleX = Phaser.Math.Linear(this.currentSquish.scaleX, 1, t);
            this.sprite.scaleY = Phaser.Math.Linear(this.currentSquish.scaleY, 1, t);
        }
    }
    destroy() {
        this.sprite.destroy();
    }
}
class Level {
    constructor(map, playerSpawn) {
        this.map = map;
        this.collisionManager = new CollisionManager(this);
        this.playerSpawn = new Phaser.Geom.Point(playerSpawn.x, playerSpawn.y);
    }
    destroy() {
        this.map.destroy();
    }
}
class LevelLoader {
    constructor(scene) {
        this.scene = scene;
    }
    preloadLevelJson() {
        this.scene.load.json('levels', 'assets/levels.json');
    }
    preloadSpritesheets() {
        this.scene.load.spritesheet('main_tileset', 'assets/main_tileset.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }
    init() {
        this.jsonData = this.scene.cache.json.get('levels');
    }
    create(name) {
        let levelJson = this.jsonData[name];
        let tilesetJson = this.jsonData['tilesets_data'][levelJson['tileset_name']];
        return new Level(this.createTilemap(levelJson, tilesetJson), levelJson['player_spawn']);
    }
    createTilemap(levelJson, tilesetJson) {
        let gridCellsX = levelJson['gridCellsX'];
        let gridCellsY = levelJson['gridCellsY'];
        let tilesData = levelJson['tiles'];
        //let entitiesData:Array<number> = layers.entities['entities'];
        let tiles = [];
        for (let i = 0; i < tilesData.length; i++) {
            let tileId = tilesData[i];
            let cellX = i % gridCellsX;
            let cellY = Math.floor(i / gridCellsX);
            let posX = cellX * TILE_WIDTH;
            let posY = cellY * TILE_HEIGHT;
            let sprite = this.makeSprite(tileId, posX, posY, levelJson['tileset_name']);
            let tileType = this.getTileType(tilesetJson, tileId);
            let hitbox = new Phaser.Geom.Rectangle(posX, posY, TILE_WIDTH, TILE_HEIGHT);
            tiles.push(new Tile(sprite, tileType, cellX, cellY, posX, posY, hitbox));
        }
        return new Tilemap(tiles, gridCellsX, gridCellsY, TILE_WIDTH, TILE_HEIGHT);
    }
    getLayers(levelJson) {
        return {
            default: levelJson['layers'][0],
            entities: levelJson['entities'][0]
        };
    }
    makeSprite(tileId, posX, posY, tilesetName) {
        if (tileId < 0) {
            return null;
        }
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        return sprite;
    }
    getTileType(tilesetJson, tileId) {
        if (tileId < 0) {
            return TileType.Empty;
        }
        let tiletypes = tilesetJson['tiletypes'];
        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileType.Solid;
        }
        if (tiletypes['semisolid'].indexOf(tileId) >= 0) {
            return TileType.SemiSolid;
        }
        return TileType.Empty;
    }
}
var TileType;
(function (TileType) {
    TileType[TileType["Empty"] = 0] = "Empty";
    TileType[TileType["Solid"] = 1] = "Solid";
    TileType[TileType["SemiSolid"] = 2] = "SemiSolid";
})(TileType || (TileType = {}));
class Tile {
    constructor(sprite, tiletype, cellX, cellY, posX, posY, hitbox) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;
    }
}
class Tilemap {
    constructor(tiles, gridCellsX, gridCellsY, tileWidth, tileHeight) {
        this.tiles = tiles;
        this.gridCellsX = gridCellsX;
        this.gridCellsY = gridCellsY;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    getTile(cellX, cellY) {
        return this.tiles[cellX + (cellY * this.gridCellsX)];
    }
    getTilesFromRect(rect, margin = 0) {
        return this.getTilesFromTo(this.toGridLocation(rect.x - margin, rect.y - margin), this.toGridLocation(rect.right + margin, rect.bottom + margin));
    }
    getTilesFromTo(from, to) {
        let tiles = [];
        for (let x = from.x; x <= to.x; x++) {
            for (let y = from.y; y <= to.y; y++) {
                let tile = this.getTile(x, y);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
    getTileNextTo(tile, x, y) {
        return this.getTile(tile.cellX + x, tile.cellY + y);
    }
    worldToTile(x, y) {
        return this.getTile(this.tocellXumn(x), this.tocellY(y));
    }
    tocellXumn(xPos) {
        return Math.floor(xPos / this.tileWidth);
    }
    tocellY(yPos) {
        return Math.floor(yPos / this.tileHeight);
    }
    toGridLocation(x, y) {
        return new Phaser.Geom.Point(this.tocellXumn(x), this.tocellY(y));
    }
    toWorldX(cellXumn) {
        return cellXumn * this.tileWidth;
    }
    toWorldY(cellY) {
        return cellY * this.tileHeight;
    }
    toWorldPosition(cellX, cellY) {
        return new Phaser.Geom.Point(this.toWorldX(cellX), this.toWorldY(cellY));
    }
    destroy() {
        // while (this.tiles.length > 0) {
        //     this.tiles[0].destroy();
        //     this.tiles.splice(0, 1);
        // }
        this.tiles.splice(0, this.tiles.length);
    }
}
/// <reference path="../entities/actor.ts"/>
class Player extends Actor {
    constructor(scene, startX, startY) {
        super(new Phaser.Geom.Rectangle(startX, startY, 16, 32));
        this.playerView = new PlayerView(scene, this);
    }
    update() {
    }
    lateUpdate() {
        this.playerView.updatePosition();
    }
}
/// <reference path="../entities/animator.ts"/>
var PlayerAnimations;
/// <reference path="../entities/animator.ts"/>
(function (PlayerAnimations) {
    PlayerAnimations.Idle = { key: 'player_walk_00.png', isSingleFrame: true };
    PlayerAnimations.Run = { key: 'walk', isSingleFrame: false };
})(PlayerAnimations || (PlayerAnimations = {}));
class PlayerView {
    constructor(scene, player) {
        this.textureKey = 'player';
        this.player = player;
        this.sprite = scene.add.sprite(0, 0, this.textureKey, PlayerAnimations.Idle.key);
        this.sprite.setOrigin(0.5, 1);
        this.animator = new Animator(scene, this.sprite, this.player);
        this.animator.createAnimation('walk', this.textureKey, 'player_walk_', 4);
        this.changeAnimation(PlayerAnimations.Run);
        this.updatePosition();
    }
    changeAnimation(animation) {
        this.animator.changeAnimation(animation.key, animation.isSingleFrame);
    }
    updatePosition() {
        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
}
var GameTime;
(function (GameTime) {
    GameTime.currentElapsedMS = (1 / 60) * 1000;
    function getElapsed() {
        return this.currentElapsedMS / 1000;
    }
    GameTime.getElapsed = getElapsed;
    function getElapsedMS() {
        return this.currentElapsedMS;
    }
    GameTime.getElapsedMS = getElapsedMS;
})(GameTime || (GameTime = {}));
let TILE_WIDTH = 16;
let TILE_HEIGHT = 16;
var MathHelper;
(function (MathHelper) {
    /**
     * Returns an integer that indicates the sign of a number.
     * So anything > 0 will return 1, and < 0 will return -1
     */
    function sign(value) {
        return value == 0 ? 0 : value > 0 ? 1 : -1;
    }
    MathHelper.sign = sign;
})(MathHelper || (MathHelper = {}));
//# sourceMappingURL=game.js.map