class Level
{
    public collisionManager:CollisionManager;
    public map:Tilemap;
    public scene:Phaser.Scene;

    public player:Player;
    public goal:LevelGoal;
    public won:boolean;

    public explosions:Explosion[];
    public explosionsPool:Explosion[];
    public projectiles:Projectile[];

    constructor(scene:Phaser.Scene, map:Tilemap, playerSpawn:any, goalPos:any) {
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);

        this.goal = new LevelGoal(scene, goalPos.x, goalPos.y);
        this.player = new Player(scene, this, playerSpawn.x, playerSpawn.y);

        this.explosions = [];
        this.explosionsPool = [];
        this.projectiles = [];

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

        // Explosions
        for (let i = 0; i < this.explosions.length; i++) {
            if (this.explosions[i].dead) {
                this.explosionsPool.push(this.explosions[i]);
                this.explosions.splice(i, 1);
                i--;
            }
            else if (this.explosions[i].canDamage) {
                if (this.explosions[i].overlaps(this.player)) {
                    console.log("hit by explosion!");
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

    public addExplosion(x:number, y:number) {
        if (this.explosionsPool.length > 0) {
            let explosion = this.explosionsPool.pop();
            explosion.replay(x, y, 6);
            this.explosions.push(explosion);
        }
        else {
            this.explosions.push(new Explosion(this.scene, x, y, 6));
        }
    }

    public addProjectile(props:any, x:number, y:number, speedX:number, speedY:number) {
        let sprite = this.scene.add.sprite(0, 0, props.texture, props.frame);
        let projectile = new Projectile(sprite, x, y, props.width, props.height, speedX, speedY);
        
        this.projectiles.push(projectile);
    }

    public destroy() {
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