class GameScene extends Phaser.Scene {

    private levelLoader:LevelLoader;
    private currentLevel:Level;

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

        let player = new Player(this, this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);
    }

    update(time:number, delta:number) {

    }

    destroy() {
        this.currentLevel.destroy();
    }
}