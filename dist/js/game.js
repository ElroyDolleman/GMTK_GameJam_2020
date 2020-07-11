class GameScene extends Phaser.Scene {
    init() {
        this.levelLoader = new LevelLoader(this);
        Inputs.initKeyInputs(this);
    }
    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('commands_sheet', 'assets/command_sheet.png', 'assets/command_sheet.json');
        this.load.atlas('levelobjects_sheet', 'assets/levelobjects_sheet.png', 'assets/levelobjects_sheet.json');
        this.load.json('commands', 'assets/commands.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }
    create() {
        this.levelLoader.init();
        this.screenTransition = new ScreenTransition(this);
        this.screenTransition.onLevelEnter();
        this.startLevel();
    }
    startLevel(levelName = 'level01') {
        this.currentLevel = this.levelLoader.create(levelName);
        this.commandManager = new CommandManager(this, levelName);
        this.commandManager.listenToCommand(commandEvents.jump, this.currentLevel.player.controller.jumpCommand, this.currentLevel.player.controller);
    }
    update(time, delta) {
        if (this.currentLevel.won) {
            this.winUpdate();
            return;
        }
        else if (this.screenTransition.active) {
            return;
        }
        this.commandManager.update();
        this.currentLevel.update();
        if (this.currentLevel.won) {
            this.onWin();
        }
    }
    onWin() {
        this.screenTransition.onLevelClose(this.endLevel, this);
    }
    winUpdate() {
    }
    endLevel() {
        this.commandManager.destroy();
        this.currentLevel.destroy();
        this.screenTransition.onLevelEnter();
        this.startLevel();
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
        result.tiles = tiles;
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
            if (tiles[i].tiletype == TileType.SemiSolid) {
                if (this.isFallingThroughSemisolid(tiles[i], result.prevBottom, actor.hitbox.bottom)) {
                    result.onBottom = true;
                    actor.hitbox.y = tiles[i].hitbox.y - actor.hitbox.height;
                }
            }
            else if (tiles[i].tiletype == TileType.Solid) {
                this.solveVerticalCollision(tiles[i], actor, result);
            }
        }
        actor.onCollisionSolved(result);
        return result;
    }
    overlapsNonEmptyTile(tile, actor) {
        return tile.tiletype != TileType.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, actor.hitbox);
    }
    isFallingThroughSemisolid(semisolidTile, prevBottom, currentBottom) {
        return prevBottom <= semisolidTile.hitbox.top && currentBottom >= semisolidTile.hitbox.top;
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
    constructor(scene) {
        this.scene = scene;
        this.createGraphics();
    }
    get active() { return this.graphics.visible; }
    ;
    createGraphics() {
        this.graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x0 }, fillStyle: { color: 0x0, alpha: 1 } });
        this.graphics.depth = 69;
        this.graphics.clear();
        let left = -10;
        let right = 380;
        let points = [{ x: left, y: 0 }];
        for (let y = 320 / 8; y <= 320; y += 320 / 8) {
            points.push({ x: left, y });
            left -= 20;
            points.push({ x: left, y });
        }
        for (let y = 320; y >= 0; y -= 320 / 8) {
            points.push({ x: right, y });
            right += 20;
            points.push({ x: right, y });
        }
        this.graphics.fillPoints(points);
        this.graphics.x = 0;
    }
    onLevelEnter() {
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: -560, duration: 1000, ease: 'Linear' },
            },
            onComplete: this.onEnterComplete.bind(this)
        });
    }
    onEnterComplete() {
        this.graphics.x = 560;
        this.graphics.setVisible(false);
    }
    onLevelClose(onDone, context) {
        this.graphics.setVisible(true);
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: 0, duration: 1000, ease: 'Linear' },
            },
            onComplete: onDone.bind(context)
        });
    }
    update() {
    }
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
    get speedDirectionX() { return MathHelper.sign(this.speed.x); }
    get speedDirectionY() { return MathHelper.sign(this.speed.y); }
    update() {
    }
    moveX() {
        this._hitbox.x += this.speed.x * GameTime.getElapsed();
    }
    moveY() {
        this._hitbox.y += this.speed.y * GameTime.getElapsed();
    }
    onCollisionSolved(result) {
    }
    hasGroundUnderneath(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            if (!tiles[i].canStandOn) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }
    isStandingOnTile(tile) {
        if (tile.hitbox.top == this.hitbox.bottom) {
            return this.hitbox.right > tile.hitbox.left && this.hitbox.left < tile.hitbox.right;
        }
        return false;
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
        this.sprite.setPosition(this.actor.x, this.actor.y);
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
    constructor(scene, map, playerSpawn, goalPos) {
        this.map = map;
        this.collisionManager = new CollisionManager(this);
        this.goal = new LevelGoal(scene, goalPos.x, goalPos.y);
        this.player = new Player(scene, playerSpawn.x, playerSpawn.y);
        this.won = false;
    }
    update() {
        this.player.update();
        this.collisionManager.moveActor(this.player);
        if (this.player.currentState == this.player.groundedState && this.goal.overlaps(this.player)) {
            this.won = true;
        }
        this.goal.update();
        this.player.lateUpdate();
    }
    destroy() {
        this.map.destroy();
        this.goal.destroy();
        this.player.destroy();
    }
}
class LevelGoal extends Actor {
    constructor(scene, x, y) {
        super(new Phaser.Geom.Rectangle(x, y, 16, 16));
        this.goalAnimator = new Animator(scene, scene.add.sprite(x, y, 'levelobjects_sheet'), this);
        this.goalAnimator.createAnimation('idle', 'levelobjects_sheet', 'goal_', 2, 12);
        this.goalAnimator.changeAnimation('idle');
        this.goalAnimator.sprite.setOrigin(0, 0);
    }
    update() {
        this.goalAnimator.updatePosition();
    }
    overlaps(actor) {
        return Phaser.Math.Difference(this.hitbox.bottom, actor.hitbox.bottom) == 0 &&
            Phaser.Geom.Rectangle.Overlaps(this.hitbox, actor.hitbox);
    }
    destroy() {
        this.goalAnimator.destroy();
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
        return new Level(this.scene, this.createTilemap(levelJson, tilesetJson), levelJson['player_spawn'], levelJson['goal']);
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
    get canStandOn() { return this.tiletype == TileType.Solid || this.tiletype == TileType.SemiSolid; }
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
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
        while (this.tiles.length > 0) {
            this.tiles[0].destroy();
            this.tiles.splice(0, 1);
        }
    }
}
/// <reference path="../entities/actor.ts"/>
class Player extends Actor {
    constructor(scene, startX, startY) {
        super(new Phaser.Geom.Rectangle(startX, startY, 16, 26));
        this.view = new PlayerView(scene, this);
        this.controller = new PlayerController(this);
        this.initStates();
    }
    get isJumping() {
        if (this.currentState == this.airborneState) {
            return this.speed.y < 0;
        }
        return false;
    }
    initStates() {
        this.groundedState = new PlayerGroundedState(this);
        this.airborneState = new PlayerAirborneState(this);
        this.currentState = this.groundedState;
    }
    update() {
        this.currentState.update();
    }
    lateUpdate() {
        this.view.updateVisuals();
    }
    onCollisionSolved(result) {
        this.currentState.onCollisionSolved(result);
    }
    changeState(newState) {
        this.currentState.leave();
        this.currentState = newState;
        this.currentState.enter();
    }
    moveLeft(maxRunSpeed, runAcceleration) {
        if (this.speed.x > -maxRunSpeed) {
            this.speed.x = Math.max(this.speed.x - runAcceleration, -maxRunSpeed);
        }
        else if (this.speed.x < -maxRunSpeed) {
            this.speed.x = Math.min(this.speed.x + runAcceleration, -maxRunSpeed);
        }
    }
    moveRight(maxRunSpeed, runAcceleration) {
        if (this.speed.x < maxRunSpeed) {
            this.speed.x = Math.min(this.speed.x + runAcceleration, maxRunSpeed);
        }
        else if (this.speed.x > maxRunSpeed) {
            this.speed.x = Math.max(this.speed.x - runAcceleration, maxRunSpeed);
        }
    }
    decelerate(deceleration) {
        if (Math.abs(this.speed.x) < deceleration) {
            this.speed.x = 0;
        }
        else {
            this.speed.x -= deceleration * MathHelper.sign(this.speed.x);
        }
    }
    destroy() {
        this.view.destroy();
    }
}
class PlayerController {
    constructor(player) {
        this.player = player;
    }
    updateMovementControls(maxRunSpeed = 110, runAcceleration = 24) {
        if (Inputs.Left.isDown) {
            this.player.moveLeft(maxRunSpeed, runAcceleration);
        }
        else if (Inputs.Right.isDown) {
            this.player.moveRight(maxRunSpeed, runAcceleration);
        }
        else {
            this.player.decelerate(runAcceleration);
        }
        //Temp
        if (Inputs.Up.isDown && this.player.airborneState != this.player.currentState) {
            this.jumpCommand();
        }
    }
    jumpCommand() {
        this.player.speed.y = -320;
        this.player.changeState(this.player.airborneState);
    }
}
/// <reference path="../entities/animator.ts"/>
var PlayerAnimations;
/// <reference path="../entities/animator.ts"/>
(function (PlayerAnimations) {
    PlayerAnimations.Idle = { key: 'player_walk_00.png', isSingleFrame: true };
    PlayerAnimations.Run = { key: 'walk', isSingleFrame: false };
    PlayerAnimations.Jump = { key: 'jump', isSingleFrame: false };
    PlayerAnimations.Fall = { key: 'fall', isSingleFrame: false };
})(PlayerAnimations || (PlayerAnimations = {}));
class PlayerView {
    constructor(scene, player) {
        this.textureKey = 'player_sheet';
        this.player = player;
        this.sprite = scene.add.sprite(0, 0, this.textureKey, PlayerAnimations.Idle.key);
        this.sprite.setOrigin(0.5, 1);
        this.createAnimations(scene);
    }
    createAnimations(scene) {
        this.animator = new Animator(scene, this.sprite, this.player);
        this.animator.createAnimation('walk', this.textureKey, 'player_walk_', 4);
        this.animator.createAnimation('jump', this.textureKey, 'player_jump_', 2);
        this.animator.createAnimation('fall', this.textureKey, 'player_fall_', 2);
        let jetFireSprite = scene.add.sprite(0, 0, this.textureKey);
        jetFireSprite.setOrigin(0.5, 0);
        this.jetFireAnimation = new Animator(scene, jetFireSprite, this.player);
        this.jetFireAnimation.createAnimation('burn', this.textureKey, 'jet_fire_', 4);
        this.jetFireAnimation.changeAnimation('burn');
        this.changeAnimation(PlayerAnimations.Idle);
        this.updateVisuals();
    }
    changeAnimation(animation) {
        this.animator.changeAnimation(animation.key, animation.isSingleFrame);
    }
    updateVisuals() {
        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);
        if (this.player.speedDirectionX == 1) {
            this.sprite.flipX = false;
        }
        else if (this.player.speedDirectionX == -1) {
            this.sprite.flipX = true;
        }
        if (this.player.isJumping) {
            this.updateJetVisuals();
        }
        else if (this.jetFireAnimation.sprite.visible) {
            this.jetFireAnimation.sprite.setVisible(false);
        }
    }
    updateJetVisuals() {
        if (!this.jetFireAnimation.sprite.visible) {
            this.jetFireAnimation.sprite.setVisible(true);
        }
        if (!this.sprite.flipX) {
            this.jetFireAnimation.sprite.setPosition(this.player.hitbox.centerX - 9, this.player.hitbox.bottom - 5);
        }
        else {
            this.jetFireAnimation.sprite.setPosition(this.player.hitbox.centerX + 10, this.player.hitbox.bottom - 5);
        }
    }
    destroy() {
        this.animator.destroy();
        this.jetFireAnimation.destroy();
    }
}
let commandEvents = {
    jump: 'jump',
};
class CommandManager {
    constructor(scene, levelName) {
        this.commandIndex = 0;
        this.timer = 0;
        this.commandEventEmitter = new Phaser.Events.EventEmitter();
        this.levelCommands = scene.cache.json.get('commands')[levelName];
        this.view = new CommandView(this, scene);
    }
    get currentCommand() { return this.levelCommands[this.commandIndex]; }
    listenToCommand(command, callback, context) {
        this.commandEventEmitter.addListener(command, callback, context);
    }
    update() {
        this.timer += GameTime.getElapsedMS();
        if (this.timer >= this.currentCommand.time) {
            this.timer -= this.currentCommand.time;
            this.commandIndex = this.getNextCommandIndex();
            this.commandEventEmitter.emit(this.currentCommand.name);
        }
        this.view.update(this.timer);
    }
    getNextCommandIndex(nextAmount = 1) {
        return (this.commandIndex + nextAmount) % this.levelCommands.length;
    }
    getNextCommand(nextAmount = 1) {
        return this.levelCommands[this.getNextCommandIndex(nextAmount)];
    }
    destroy() {
        this.commandEventEmitter.removeAllListeners();
        this.view.destroy();
    }
}
class CommandView {
    constructor(commandManager, scene) {
        this.scene = scene;
        this.commandManager = commandManager;
        this.container = scene.add.container(this.x, this.y);
        this.createBackground();
        this.createCommandSprites();
    }
    get x() { return 48; }
    ;
    get y() { return 320 - 16; }
    ;
    createCommandSprites() {
        this.sprites = [];
        this.container.add(this.scene.add.sprite(0, 0, 'commands_sheet', 'indicator.png'));
        let currentX = 0;
        this.commandManager.levelCommands.forEach(command => {
            currentX += this.convertTimeToXPos(command.time);
            let sprite = this.scene.add.sprite(currentX, 0, 'commands_sheet', 'command_' + command.name + '.png');
            this.container.add(sprite);
            this.sprites.push(sprite);
        });
    }
    createBackground() {
        this.graphics = this.scene.add.graphics({ fillStyle: { color: 0x0, alpha: 1 } });
        this.graphics.fillRect(-this.x, -16, 320, 32);
        this.container.add(this.graphics);
    }
    update(currentTime) {
        let totalTime = 0;
        let commandsLength = this.commandManager.levelCommands.length;
        for (let i = 0; i < commandsLength; i++) {
            let index = this.commandManager.getNextCommandIndex(i);
            let command = this.commandManager.levelCommands[index];
            totalTime += command.time;
            this.sprites[index].setX(this.convertTimeToXPos(totalTime - currentTime));
        }
    }
    convertTimeToXPos(time) {
        return time / 8;
    }
    destroy() {
        this.container.destroy();
    }
}
class PlayerBaseState {
    constructor(player) {
        this.player = player;
    }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
    }
}
/// <reference path="./player_base_state.ts"/>
class PlayerAirborneState extends PlayerBaseState {
    constructor(player) {
        super(player);
    }
    enter() {
        this.updateAnim();
    }
    update() {
        let prevSpeedY = this.player.speed.y;
        this.player.controller.updateMovementControls();
        this.updateGravity();
        if (MathHelper.sign(prevSpeedY) != MathHelper.sign(this.player.speed.y)) {
            this.updateAnim();
        }
    }
    leave() {
    }
    updateGravity(gravity = 16, maxFallSpeed = 240) {
        if (this.player.speed.y < maxFallSpeed) {
            this.player.speed.y = Math.min(this.player.speed.y + gravity, maxFallSpeed);
        }
    }
    onCollisionSolved(result) {
        if (result.onBottom) {
            this.player.speed.y = 0;
            this.player.changeState(this.player.groundedState);
        }
        else if (result.onTop) {
            this.player.speed.y = 0;
        }
    }
    updateAnim() {
        if (this.player.speed.y < 0) {
            this.player.view.changeAnimation(PlayerAnimations.Jump);
        }
        else if (this.player.speed.y >= 0) {
            this.player.view.changeAnimation(PlayerAnimations.Fall);
        }
    }
}
/// <reference path="./player_airborne_state.ts"/>
class PlayerFallState extends PlayerAirborneState {
    constructor(player) {
        super(player);
    }
    enter() {
    }
    update() {
    }
    leave() {
    }
}
/// <reference path="./player_base_state.ts"/>
class PlayerGroundedState extends PlayerBaseState {
    constructor(player) {
        super(player);
    }
    enter() {
        this.updateAnim();
    }
    update() {
        let prevSpeedX = this.player.speed.x;
        this.player.controller.updateMovementControls();
        if (MathHelper.sign(prevSpeedX) != MathHelper.sign(this.player.speed.x)) {
            this.updateAnim();
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (!this.player.hasGroundUnderneath(result.tiles)) {
            this.player.changeState(this.player.airborneState);
        }
    }
    updateAnim() {
        if (MathHelper.sign(this.player.speed.x) == 0) {
            this.player.view.changeAnimation(PlayerAnimations.Idle);
        }
        else {
            this.player.view.changeAnimation(PlayerAnimations.Run);
        }
    }
}
/// <reference path="./player_airborne_state.ts"/>
class PlayerJumpState extends PlayerAirborneState {
    constructor(player) {
        super(player);
    }
    enter() {
        this.player.speed.y = -24;
    }
    update() {
    }
    leave() {
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
var Inputs;
(function (Inputs) {
    function initKeyInputs(scene) {
        Inputs.Up = scene.input.keyboard.addKey('up');
        Inputs.Left = scene.input.keyboard.addKey('left');
        Inputs.Down = scene.input.keyboard.addKey('down');
        Inputs.Right = scene.input.keyboard.addKey('right');
    }
    Inputs.initKeyInputs = initKeyInputs;
})(Inputs || (Inputs = {}));
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