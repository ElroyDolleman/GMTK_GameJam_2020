class Level
{
    public collisionManager:CollisionManager;
    public map:Tilemap;
    public readonly playerSpawn:Phaser.Geom.Point;

    constructor(map:Tilemap, playerSpawn:any) {
        this.map = map;
        this.collisionManager = new CollisionManager(this);
        this.playerSpawn = new Phaser.Geom.Point(playerSpawn.x, playerSpawn.y);
    }

    public destroy() {
        this.map.destroy();
    }
}