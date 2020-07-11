class GameScene extends Phaser.Scene {

    private commandManager:CommandManager
    private levelLoader:LevelLoader;
    private currentLevel:Level;
    private player:Player;

    init() {
        this.levelLoader = new LevelLoader(this);
        Inputs.initKeyInputs(this);
    }

    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('commands_sheet', 'assets/command_sheet.png', 'assets/command_sheet.json');
        this.load.json('commands', 'assets/commands.json');

        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }

    create() {
        let levelName = 'level01';

        this.levelLoader.init();
        this.currentLevel = this.levelLoader.create(levelName);

        this.player = new Player(this, this.currentLevel.playerSpawn.x, this.currentLevel.playerSpawn.y);
        
        this.commandManager = new CommandManager(this, levelName);
        this.commandManager.listenToCommand(commandEvents.jump, this.player.controller.jumpCommand, this.player.controller);
    }

    update(time:number, delta:number) {
        this.commandManager.update();
        this.player.update();

        this.currentLevel.collisionManager.moveActor(this.player);

        this.player.lateUpdate();
    }

    destroy() {
        this.currentLevel.destroy();
    }
}