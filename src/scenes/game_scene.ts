class GameScene extends Phaser.Scene {

    private commandManager:CommandManager
    private levelLoader:LevelLoader;
    private currentLevel:Level;
    private screenTransition:ScreenTransition;

    init() {
        this.levelLoader = new LevelLoader(this);
        Inputs.initKeyInputs(this);
    }

    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('effects_sheet', 'assets/effects_sheet.png', 'assets/effects_sheet.json');
        this.load.atlas('commands_sheet', 'assets/command_sheet.png', 'assets/command_sheet.json');
        this.load.atlas('levelobjects_sheet', 'assets/levelobjects_sheet.png', 'assets/levelobjects_sheet.json');

        this.load.json('commands', 'assets/commands.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
    }

    create() {
        this.levelLoader.init();

        this.screenTransition = new ScreenTransition(this);
        this.screenTransition.onLevelEnter();

        this.startLevel();
    }

    startLevel(levelName = 'level01') {
        this.currentLevel = this.levelLoader.create(levelName);

        this.commandManager = new CommandManager(this, levelName);
        this.commandManager.listenToCommand(commandEvents.jump, this.currentLevel.player.controller.jumpCommand, this.currentLevel.player.controller);
    }

    update(time:number, delta:number) {
        if (this.currentLevel.won) {
            this.winUpdate();
            return;
        }
        else if (this.screenTransition.active) {
            return;
        }

        this.commandManager.update();
        this.currentLevel.update();

        if (this.currentLevel.won) {
            this.onWin();
        }
    }

    onWin() {
        this.screenTransition.onLevelClose(this.endLevel, this);
    }
    winUpdate() {

    }
    endLevel() {
        this.commandManager.destroy();
        this.currentLevel.destroy();
        this.screenTransition.onLevelEnter();

        this.startLevel();
    }

    destroy() {
        this.currentLevel.destroy();
    }
}