enum TileType {
    Empty,
    Solid,
    SemiSolid,
}

class Tile
{
    public readonly cellX:number;
    public readonly cellY:number;
    public sprite:Phaser.GameObjects.Sprite;
    public hitbox:Phaser.Geom.Rectangle;
    public position:Phaser.Geom.Point;
    public tiletype:TileType;

    public canStandOn():boolean { return this.tiletype == TileType.Solid || this.tiletype == TileType.SemiSolid; }

    constructor(sprite:Phaser.GameObjects.Sprite, tiletype:TileType, cellX:number, cellY:number, posX:number, posY:number, hitbox:Phaser.Geom.Rectangle) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        
        this.tiletype = tiletype;
        this.hitbox = hitbox;
        this.sprite = sprite;
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}