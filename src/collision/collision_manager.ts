class CollisionResult {
    onTop:boolean = false;
    onLeft:boolean = false;
    onRight:boolean = false;
    onBottom:boolean = false;
    tiles:Tile[] = [];
    prevTop:number = 0;
    prevLeft:number = 0;
    prevRight:number = 0;
    prevBottom:number = 0;
    isCrushed:boolean = false;
    isDamaged:boolean = false;
}

class CollisionManager {

    private currentLevel:Level;
    constructor(level:Level) {
        this.currentLevel = level;
    }

    public moveActor(actor:Actor):CollisionResult {
        let result:CollisionResult = new CollisionResult();
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

    public overlapsSolidTile(actor:Actor):boolean {
        let tiles = this.currentLevel.map.getTilesFromRect(actor.nextHitbox, 2);

        for (let i = 0; i < tiles.length; i++) {
            if (this.overlapsNonEmptyTile(tiles[i], actor) && tiles[i].tiletype == TileType.Solid) {
                return true;
            }
        }
        return false;
    }

    private overlapsNonEmptyTile(tile:Tile, actor:Actor) {
        return tile.tiletype != TileType.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, actor.hitbox);
    }

    private isFallingThroughSemisolid(semisolidTile: Tile, prevBottom: number, currentBottom: number) {
        return prevBottom <= semisolidTile.hitbox.top && currentBottom >= semisolidTile.hitbox.top;
    }

    private solveHorizontalCollision(tile:Tile, actor:Actor, result:CollisionResult) {
        if (actor.speed.x > 0) {
            result.onRight = true;
            actor.hitbox.x = tile.hitbox.x - actor.hitbox.width;
        }
        else if (actor.speed.x < 0) {
            result.onLeft = true;
            actor.hitbox.x = tile.hitbox.right;
        }
    }
    private solveVerticalCollision(tile:Tile, actor:Actor, result:CollisionResult) {
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