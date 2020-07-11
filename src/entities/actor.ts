class Actor {
    
    public speed:Phaser.Math.Vector2;

    public get position():Phaser.Math.Vector2 { 
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }
    public get x():number { return this._hitbox.x; }
    public get y():number { return this._hitbox.y; }

    public set x(x:number) { this._hitbox.x = x; }
    public set y(y:number) { this._hitbox.y = y; }

    protected _hitbox:Phaser.Geom.Rectangle;
    public get hitbox():Phaser.Geom.Rectangle {
        return this._hitbox;
    }
    public get nextHitbox():Phaser.Geom.Rectangle {
        return new Phaser.Geom.Rectangle(
            this.x + this.speed.x * GameTime.getElapsed(),
            this.y + this.speed.y * GameTime.getElapsed(),
            this.hitbox.width,
            this.hitbox.height
        );
    }

    public get speedDirectionX():number { return MathHelper.sign(this.speed.x); }
    public get speedDirectionY():number { return MathHelper.sign(this.speed.y); }

    constructor(hitbox:Phaser.Geom.Rectangle) {
        this.speed = new Phaser.Math.Vector2();
        this._hitbox = hitbox;
    }

    public update() {
        
    }

    public moveX() {
        this._hitbox.x += this.speed.x * GameTime.getElapsed();
    }
    public moveY() {
        this._hitbox.y += this.speed.y * GameTime.getElapsed();
    }

    onCollisionSolved(result:CollisionResult) {
    }

    public hasGroundUnderneath(tiles:Tile[]):boolean {
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

    public isStandingOnTile(tile:Tile):boolean {
        if (tile.hitbox.top == this.hitbox.bottom) {
            return this.hitbox.right > tile.hitbox.left && this.hitbox.left < tile.hitbox.right;
        }
    }
}