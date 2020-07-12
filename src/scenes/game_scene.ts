//let elroy:Phaser.Scene;

class GameScene extends Phaser.Scene {

    private commandManager:CommandManager
    private levelLoader:LevelLoader;
    private currentLevel:Level;
    private screenTransition:ScreenTransition;

    private levelNum:number = 1;

    private startView:StartView;

    init() {
        this.levelLoader = new LevelLoader(this);

        //elroy = this;
    }

    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('effects_sheet', 'assets/effects_sheet.png', 'assets/effects_sheet.json');
        this.load.atlas('commands_sheet', 'assets/command_sheet.png', 'assets/command_sheet.json');
        this.load.atlas('levelobjects_sheet', 'assets/levelobjects_sheet.png', 'assets/levelobjects_sheet.json');

        this.load.json('commands', 'assets/commands.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();

        new AudioManager(this);
    }

    create() {
        let frameNames = this.anims.generateFrameNames('effects_sheet', { 
            prefix: 'dust_',
            suffix: '.png',
            end: 5,
            zeroPad: 2
        });
        frameNames.forEach((e) => { dustFrames.push(e.frame.toString()); });

        new InputManager(this);
        inputManager.firstInputCallback = this.startGame.bind(this);

        audioManager.addSoundsToGame(this);
        this.levelLoader.init();

        this.screenTransition = new ScreenTransition(this);

        this.startView = new StartView(this);
    }

    startGame() {
        this.cameras.main.setBackgroundColor('#5d5bff');

        this.startView.destroy();
        gameStarted = true;

        this.screenTransition.onLevelEnter();
        this.startLevel();
        
        GameTime.startTime = new Date();
        audioManager.playMusic(this);
    }

    startLevel() {
        if (particleManager) particleManager.destroy();
        particleManager = this.add.particles('effects_sheet');
        particleManager.setDepth(1);

        let levelName = this.levelLoader.getName(this.levelNum);

        this.currentLevel = this.levelLoader.create(levelName);

        this.commandManager = new CommandManager(this, levelName);
        this.commandManager.listenToCommand(commandEvents.jump, this.currentLevel.player.controller.jumpCommand, this.currentLevel.player.controller);
        this.commandManager.listenToCommand(commandEvents.rocket, this.currentLevel.player.controller.shootRocketCommand, this.currentLevel.player.controller);
    }

    update(time:number, delta:number) {
        inputManager.update(this);
        if (!gameStarted) return;

        if (this.currentLevel.won) {
            this.winUpdate();
            return;
        }
        else if (this.screenTransition.active) {
            return;
        }

        if (!this.currentLevel.player.dead) {
            this.commandManager.update();
        }

        let wasDead = this.currentLevel.player.dead;
        this.currentLevel.update();

        if (!wasDead && this.currentLevel.player.dead) {
            setTimeout(this.onDead.bind(this), 800);
        }
        else if (this.currentLevel.won) {
            this.currentLevel.player.view.changeAnimation(PlayerAnimations.Victory);
            setTimeout(this.onWin.bind(this), 500);
        }
    }

    onWin() {
        this.screenTransition.onLevelClose(this.endLevel, this);
    }
    onDead() {
        this.screenTransition.onLevelClose(this.restartLevel, this);
    }

    winUpdate() {

    }

    endLevel() {
        this.commandManager.destroy();
        this.currentLevel.destroy();

        this.levelNum++;
        let levelName = this.levelLoader.getName(this.levelNum);
        if (!this.levelLoader.exists(levelName)) {
            GameTime.endTime = new Date();
            new EndView(this);
            return;
        }

        this.screenTransition.onLevelEnter();
        this.startLevel();
    }
    restartLevel() {
        this.commandManager.destroy();
        this.currentLevel.destroy();
        this.screenTransition.onLevelEnter();

        this.startLevel();
    }

    destroy() {
        this.currentLevel.destroy();
    }
}