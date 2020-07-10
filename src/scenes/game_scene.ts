class GameScene extends Phaser.Scene {

    private levelLoader:LevelLoader;
    private currentLevel:Level;

    init() {
        this.levelLoader = new LevelLoader(this);
    }

    preload() {
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }

    create() {
        this.levelLoader.init();
        this.currentLevel = this.levelLoader.create('level01');
    }

    update(time:number, delta:number) {

    }

    destroy() {
        this.currentLevel.destroy();
    }
}