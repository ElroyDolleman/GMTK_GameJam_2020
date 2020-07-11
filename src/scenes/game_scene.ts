class GameScene extends Phaser.Scene {

    private levelLoader:LevelLoader;
    private currentLevel:Level;
    private player:Player;

    init() {
        this.levelLoader = new LevelLoader(this);
    }

    preload() {
        this.load.atlas('player', 'assets/player.png', 'assets/player.json');

        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }

    create() {
        this.levelLoader.init();
        this.currentLevel = this.levelLoader.create('level01');

        this.player = new Player(this, this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);
        this.player.speed.x = 24;
    }

    update(time:number, delta:number) {
        this.player.update();

        this.currentLevel.collisionManager.moveActor(this.player);

        this.player.lateUpdate();
    }

    destroy() {
        this.currentLevel.destroy();
    }
}