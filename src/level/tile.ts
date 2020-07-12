enum TileType {
    Empty,
    Solid,
    SemiSolid,
    Hazard,
    Breakable,
}

class Tile
{
    public readonly cellX:number;
    public readonly cellY:number;
    public sprite:Phaser.GameObjects.Sprite;
    public hitbox:Phaser.Geom.Rectangle;
    public position:Phaser.Geom.Point;
    public tiletype:TileType;

    public get isSolid():boolean { return this.tiletype == TileType.Solid || this.tiletype == TileType.Breakable; }
    public get canStandOn():boolean { return this.tiletype == TileType.Solid || this.tiletype == TileType.SemiSolid || this.tiletype == TileType.Breakable; }

    //private debug:Phaser.GameObjects.Graphics;

    constructor(sprite:Phaser.GameObjects.Sprite, tiletype:TileType, cellX:number, cellY:number, posX:number, posY:number, hitbox:Phaser.Geom.Rectangle) {
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

        if (tiletype == TileType.Hazard) {
            if (this.hitbox.width == 16) {
                this.hitbox.width -= 4;
                this.hitbox.x += 2;
            }
            if (this.hitbox.height == 16) {
                this.hitbox.height -= 4;
                this.hitbox.y += 2;
            }
        }
    }

    public break() {
        this.tiletype = TileType.Empty;
        this.sprite.destroy();
    }

    public destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}