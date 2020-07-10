class Actor {
    protected _hitbox:Phaser.Geom.Rectangle;

    public get position():Phaser.Math.Vector2 { 
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }
    public get x():number { return this._hitbox.x; }
    public get y():number { return this._hitbox.y; }

    public set x(x:number) { this._hitbox.x = x; }
    public set y(y:number) { this._hitbox.y = y; }

    public get hitbox():Phaser.Geom.Rectangle {
        return this._hitbox;
    }

    constructor(hitbox:Phaser.Geom.Rectangle) {
        this._hitbox = hitbox;
    }

    public update() {
        
    }

    public moveX(amount:number) {
        this._hitbox.x += amount;
    }
    public moveY(amount:number) {
        this._hitbox.y += amount;
    }
}