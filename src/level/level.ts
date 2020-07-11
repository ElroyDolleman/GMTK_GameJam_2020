class Level
{
    public collisionManager:CollisionManager;
    public map:Tilemap;

    public player:Player;
    public goal:LevelGoal;
    public won:boolean;

    constructor(scene:Phaser.Scene, map:Tilemap, playerSpawn:any, goalPos:any) {
        this.map = map;
        this.collisionManager = new CollisionManager(this);

        this.goal = new LevelGoal(scene, goalPos.x, goalPos.y);
        this.player = new Player(scene, playerSpawn.x, playerSpawn.y);

        this.won = false;
    }

    public update() {
        this.player.update();

        this.collisionManager.moveActor(this.player);

        if (this.player.currentState == this.player.groundedState && this.goal.overlaps(this.player)) {
            this.won = true;
        }

        this.goal.update();
        this.player.lateUpdate();
    }

    public destroy() {
        this.map.destroy();
        this.goal.destroy();
        this.player.destroy();
    }
}