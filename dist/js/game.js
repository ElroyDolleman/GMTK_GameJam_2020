//let elroy:Phaser.Scene;
class GameScene extends Phaser.Scene {
    constructor() {
        super(...arguments);
        this.levelNum = 1;
    }
    init() {
        this.levelLoader = new LevelLoader(this);
        Inputs.initKeyInputs(this);
        //elroy = this;
    }
    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('effects_sheet', 'assets/effects_sheet.png', 'assets/effects_sheet.json');
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
    startLevel() {
        let levelNumString = this.levelNum < 10 ? '0' + this.levelNum : this.levelNum.toString();
        let levelName = 'level' + levelNumString;
        this.currentLevel = this.levelLoader.create(levelName);
        this.commandManager = new CommandManager(this, levelName);
        this.commandManager.listenToCommand(commandEvents.jump, this.currentLevel.player.controller.jumpCommand, this.currentLevel.player.controller);
        this.commandManager.listenToCommand(commandEvents.rocket, this.currentLevel.player.controller.shootRocketCommand, this.currentLevel.player.controller);
    }
    update(time, delta) {
        if (this.currentLevel.won) {
            this.winUpdate();
            return;
        }
        else if (this.screenTransition.active) {
            return;
        }
        if (!this.currentLevel.player.dead) {
            this.commandManager.update();
        }
        let wasDead = this.currentLevel.player.dead;
        this.currentLevel.update();
        if (!wasDead && this.currentLevel.player.dead) {
            setTimeout(this.onDead.bind(this), 800);
        }
        else if (this.currentLevel.won) {
            this.currentLevel.player.view.changeAnimation(PlayerAnimations.Victory);
            setTimeout(this.onWin.bind(this), 500);
        }
    }
    onWin() {
        this.screenTransition.onLevelClose(this.endLevel, this);
    }
    onDead() {
        this.screenTransition.onLevelClose(this.restartLevel, this);
    }
    winUpdate() {
    }
    endLevel() {
        this.commandManager.destroy();
        this.currentLevel.destroy();
        this.screenTransition.onLevelEnter();
        this.levelNum++;
        this.startLevel();
    }
    restartLevel() {
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
            if (tiles[i].isSolid) {
                this.solveHorizontalCollision(tiles[i], actor, result);
            }
            else if (tiles[i].tiletype == TileType.Hazard) {
                result.isDamaged = true;
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
            else if (tiles[i].isSolid) {
                this.solveVerticalCollision(tiles[i], actor, result);
            }
            else if (tiles[i].tiletype == TileType.Hazard) {
                result.isDamaged = true;
            }
        }
        actor.onCollisionSolved(result);
        return result;
    }
    getOverlappingSolidTiles(actor) {
        let tiles = this.currentLevel.map.getTilesFromRect(actor.nextHitbox, 2);
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], actor) || !tiles[i].isSolid) {
                tiles.splice(i, 1);
                i--;
            }
        }
        return tiles;
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
var ProjectileTypes;
(function (ProjectileTypes) {
    ProjectileTypes.playerRocket = {
        texture: 'player_sheet',
        frame: 'rocket_00.png',
        width: 14,
        height: 5,
    };
})(ProjectileTypes || (ProjectileTypes = {}));
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
    addOnCompleteCallback(callback, context) {
        this.sprite.on('animationcomplete', callback, context);
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
class Explosion extends Actor {
    constructor(scene, x, y, radius) {
        super(new Phaser.Geom.Rectangle(x, y, 0, 0));
        this.dead = false;
        this.animation = new Animator(scene, scene.add.sprite(x, y, 'effects_sheet', 'explosion_00.png'), this);
        this.animation.createAnimation('boom', 'effects_sheet', 'explosion_', 6, 14, 0);
        this.animation.addOnCompleteCallback(this.animationDone, this);
        this.animation.sprite.setOrigin(0.5, 0.5);
        this.replay(x, y, radius);
    }
    get canDamage() { return this.animation.sprite.anims.currentFrame.index > 3; }
    ;
    replay(x, y, radius) {
        this.damageCircle = new Phaser.Geom.Circle(this.hitbox.centerX, this.hitbox.centerY, radius);
        this.animation.sprite.x = x;
        this.animation.sprite.y = y;
        this.animation.changeAnimation('boom');
        this.animation.sprite.setVisible(true);
        this.dead = false;
    }
    animationDone() {
        this.dead = true;
        this.animation.sprite.setVisible(false);
    }
    overlaps(actor) {
        return Phaser.Geom.Intersects.CircleToRectangle(this.damageCircle, actor.hitbox);
    }
    destroy() {
        this.animation.destroy();
    }
}
class Projectile extends Actor {
    constructor(sprite, x, y, width, height, speedX, speedY) {
        super(new Phaser.Geom.Rectangle(x, y, width, height));
        this.sprite = sprite;
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.x = this.hitbox.centerX;
        this.sprite.y = this.hitbox.centerY;
        this.speed.x = speedX;
        this.speed.y = speedY;
        if (this.speedDirectionX == 1) {
            this.sprite.flipX = false;
        }
        else if (this.speedDirectionX == -1) {
            this.sprite.flipX = true;
        }
    }
    moveX() {
        super.moveX();
        this.sprite.x = this.hitbox.centerX;
    }
    moveY() {
        super.moveY();
        this.sprite.y = this.hitbox.centerY;
    }
    destroy() {
        this.sprite.destroy();
    }
}
class Level {
    constructor(scene, map, playerSpawn, goalPos) {
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);
        this.goal = new LevelGoal(scene, goalPos.x, goalPos.y);
        this.player = new Player(scene, this, playerSpawn.x, playerSpawn.y + 32);
        this.explosions = [];
        this.explosionsPool = [];
        this.projectiles = [];
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
        // Explosions
        for (let i = 0; i < this.explosions.length; i++) {
            if (this.explosions[i].dead) {
                this.explosionsPool.push(this.explosions[i]);
                this.explosions.splice(i, 1);
                i--;
            }
            else if (this.explosions[i].canDamage) {
                if (!this.player.dead && this.explosions[i].overlaps(this.player)) {
                    this.player.die();
                }
            }
        }
        // Projectiles
        for (let i = 0; i < this.projectiles.length; i++) {
            let projectile = this.projectiles[i];
            projectile.moveX();
            projectile.moveY();
            let tiles = this.collisionManager.getOverlappingSolidTiles(projectile);
            if (tiles.length > 0) {
                tiles.forEach(tile => {
                    if (tile.tiletype == TileType.Breakable) {
                        tile.break();
                    }
                });
                this.addExplosion(projectile.hitbox.centerX, projectile.hitbox.centerY);
                projectile.destroy();
                this.projectiles.splice(i, 1);
                i--;
            }
        }
    }
    addExplosion(x, y) {
        if (this.explosionsPool.length > 0) {
            let explosion = this.explosionsPool.pop();
            explosion.replay(x, y, 6);
            this.explosions.push(explosion);
        }
        else {
            this.explosions.push(new Explosion(this.scene, x, y, 6));
        }
    }
    addProjectile(props, x, y, speedX, speedY) {
        let sprite = this.scene.add.sprite(0, 0, props.texture, props.frame);
        let projectile = new Projectile(sprite, x, y, props.width, props.height, speedX, speedY);
        this.projectiles.push(projectile);
    }
    destroy() {
        for (let i = 0; i < this.explosions.length; i++) {
            this.explosions[i].destroy();
        }
        for (let i = 0; i < this.explosionsPool.length; i++) {
            this.explosionsPool[i].destroy();
        }
        for (let i = 0; i < this.projectiles.length; i++) {
            this.projectiles[i].destroy();
        }
        this.map.destroy();
        this.goal.destroy();
        this.player.destroy();
    }
}
class LevelGoal extends Actor {
    constructor(scene, x, y) {
        super(new Phaser.Geom.Rectangle(x, y, 16, 16));
        this.goalAnimator = new Animator(scene, scene.add.sprite(x, y, 'levelobjects_sheet'), this);
        this.goalAnimator.createAnimation('idle', 'levelobjects_sheet', 'goal_', 2, 8);
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
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
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
            let rotation = 0;
            if (tileId >= FLIPPED_DIAGONALLY_FLAG) {
                rotation = this.getRotation(tileId);
                tileId &= ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);
            }
            let cellX = i % gridCellsX;
            let cellY = Math.floor(i / gridCellsX);
            let posX = cellX * TILE_WIDTH;
            let posY = cellY * TILE_HEIGHT;
            let sprite = this.makeSprite(tileId, posX, posY, rotation, levelJson['tileset_name']);
            let tileType = this.getTileType(tilesetJson, tileId);
            let hitboxData = tilesetJson['customHitboxes'][tileId.toString()];
            let hitbox = this.getHitbox(hitboxData, posX, posY, rotation);
            //let hitbox = new Phaser.Geom.Rectangle(posX, posY, width, height);
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
    makeSprite(tileId, posX, posY, rotation, tilesetName) {
        if (tileId < 0) {
            return null;
        }
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(rotation);
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
        if (tiletypes['spikes'].indexOf(tileId) >= 0) {
            return TileType.Hazard;
        }
        if (tiletypes['breakable'].indexOf(tileId) >= 0) {
            return TileType.Breakable;
        }
        return TileType.Empty;
    }
    getRotation(tileId) {
        let flippedH = (tileId & FLIPPED_HORIZONTALLY_FLAG) > 0;
        let flippedV = (tileId & FLIPPED_VERTICALLY_FLAG) > 0;
        let flippedD = (tileId & FLIPPED_DIAGONALLY_FLAG) > 0;
        if (!flippedH && flippedV && flippedD) {
            return 1.5 * Math.PI; //270
        }
        else if (!flippedH && !flippedV && flippedD) {
            return 0.5 * Math.PI; // 90
        }
        else if (flippedV && !flippedD) {
            return Math.PI;
        }
        console.warn("the tileId is stored as if it has been rotated/flipped, but the code does not recognize it");
        return 0;
    }
    getHitbox(hitboxData, posX, posY, rotation) {
        let width = TILE_WIDTH;
        let height = TILE_HEIGHT;
        let hitbox = new Phaser.Geom.Rectangle(posX, posY, width, height);
        if (!hitboxData)
            return hitbox;
        if (hitboxData['x'])
            hitbox.x += hitboxData['x'];
        if (hitboxData['y'])
            hitbox.y += hitboxData['y'];
        if (hitboxData['width'])
            hitbox.width = hitboxData['width'];
        if (hitboxData['height'])
            hitbox.height = hitboxData['height'];
        return this.rotateHitbox(hitbox, rotation);
    }
    rotateHitbox(hitbox, rotation) {
        if (rotation == 0)
            return hitbox;
        let offsetY = TILE_HEIGHT - hitbox.height;
        let degree = Phaser.Math.RadToDeg(rotation);
        switch (degree) {
            case -90:
            case 270:
                hitbox.x += offsetY;
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 90:
            case -270:
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 180:
            case -180:
                hitbox.y -= offsetY;
                break;
        }
        return hitbox;
    }
}
var TileType;
(function (TileType) {
    TileType[TileType["Empty"] = 0] = "Empty";
    TileType[TileType["Solid"] = 1] = "Solid";
    TileType[TileType["SemiSolid"] = 2] = "SemiSolid";
    TileType[TileType["Hazard"] = 3] = "Hazard";
    TileType[TileType["Breakable"] = 4] = "Breakable";
})(TileType || (TileType = {}));
class Tile {
    //private debug:Phaser.GameObjects.Graphics;
    constructor(sprite, tiletype, cellX, cellY, posX, posY, hitbox) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.tiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;
        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }
    get isSolid() { return this.tiletype == TileType.Solid || this.tiletype == TileType.Breakable; }
    get canStandOn() { return this.tiletype == TileType.Solid || this.tiletype == TileType.SemiSolid || this.tiletype == TileType.Breakable; }
    break() {
        this.tiletype = TileType.Empty;
        this.sprite.destroy();
    }
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
    constructor(scene, level, startX, startY) {
        super(new Phaser.Geom.Rectangle(startX, startY - 26, 16, 26));
        this.dead = false;
        this.deadTimer = 0;
        this.level = level;
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
        if (this.dead) {
            this.updateDead();
            return;
        }
        this.currentState.update();
    }
    lateUpdate() {
        this.view.updateVisuals();
    }
    updateDead() {
        if (this.speed.y < 240) {
            this.speed.y = Math.min(this.speed.y + 16, 240);
        }
        this.deadTimer += GameTime.getElapsedMS();
        if (this.deadTimer > 250) {
            this.deadTimer -= 250;
            let offsetX = 12 - Math.random() * 24;
            let offsetY = 12 - Math.random() * 24;
            this.level.addExplosion(this.hitbox.centerX + offsetX, this.hitbox.centerY + offsetY);
        }
    }
    onCollisionSolved(result) {
        if (this.dead)
            return;
        if (result.isDamaged) {
            this.die();
        }
        else {
            this.currentState.onCollisionSolved(result);
        }
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
    die() {
        this.dead = true;
        this.view.changeAnimation(PlayerAnimations.Dead);
        this.speed.x = 0;
        if (this.speed.y < 0)
            this.speed.y = 0;
        this.level.addExplosion(this.hitbox.centerX, this.hitbox.centerY);
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
    }
    jumpCommand() {
        this.player.speed.y = -320;
        this.player.changeState(this.player.airborneState);
    }
    shootRocketCommand() {
        let dir = this.player.view.animator.facingDirection;
        let xpos = this.player.hitbox.centerX - ProjectileTypes.playerRocket.width / 2;
        this.player.level.addProjectile(ProjectileTypes.playerRocket, xpos + (8 * dir), this.player.hitbox.centerY - 3, 140 * dir, 0);
    }
}
/// <reference path="../entities/animator.ts"/>
var PlayerAnimations;
/// <reference path="../entities/animator.ts"/>
(function (PlayerAnimations) {
    PlayerAnimations.Idle = { key: 'player_walk_00.png', isSingleFrame: true };
    PlayerAnimations.Dead = { key: 'player_dead_00.png', isSingleFrame: true };
    PlayerAnimations.Run = { key: 'walk', isSingleFrame: false };
    PlayerAnimations.Jump = { key: 'jump', isSingleFrame: false };
    PlayerAnimations.Fall = { key: 'fall', isSingleFrame: false };
    PlayerAnimations.Victory = { key: 'victory', isSingleFrame: false };
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
        this.animator.createAnimation('jump', this.textureKey, 'player_jump_', 2, 10);
        this.animator.createAnimation('fall', this.textureKey, 'player_fall_', 2, 12);
        this.animator.createAnimation('victory', this.textureKey, 'player_victory_', 8, 16, 0);
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
    rocket: 'rocket',
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
            this.commandEventEmitter.emit(this.currentCommand.name);
            this.commandIndex = this.getNextCommandIndex();
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
    updateGravity(gravity = 16, maxFallSpeed = 220) {
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
        //Inputs.Up = scene.input.keyboard.addKey('up');
        Inputs.Left = scene.input.keyboard.addKey('left');
        //Inputs.Down = scene.input.keyboard.addKey('down');
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