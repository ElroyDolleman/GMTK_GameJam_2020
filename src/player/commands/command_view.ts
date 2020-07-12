class CommandView {

    private scene:Phaser.Scene;
    private commandManager:CommandManager;
    private container:Phaser.GameObjects.Container;
    private sprites:Phaser.GameObjects.Sprite[];

    private graphics:Phaser.GameObjects.Graphics;

    private get x():number { return 48; };
    private get y():number { return 320-16; };

    constructor(commandManager:CommandManager, scene:Phaser.Scene) {
        this.scene = scene;
        this.commandManager = commandManager;
        this.container = scene.add.container(this.x, this.y);
        
        this.createBackground();
        this.createCommandSprites();
    }

    private createCommandSprites() {
        this.sprites = [];
        this.container.add(this.scene.add.sprite(0, 0, 'commands_sheet', 'indicator.png'));

        let currentX = 0;
        this.commandManager.levelCommands.forEach(command => {
            currentX += this.convertTimeToXPos(command.time);
            let sprite = this.scene.add.sprite(currentX, 0, 'commands_sheet', 'command_' + command.name + '.png');
            this.container.add(sprite);
            this.sprites.push(sprite);
        });
    }

    private createBackground() {
        this.graphics = this.scene.add.graphics({ fillStyle: { color: 0x0, alpha: 1 } });
        this.graphics.fillRect(-this.x, -16, 320, 32);
        this.container.add(this.graphics);
    }

    public update(currentTime:number) {
        let totalTime = 0;
        let commandsLength = this.commandManager.levelCommands.length;

        for (let i = 0; i < commandsLength; i++) {
            let index = this.commandManager.getNextCommandIndex(i);
            let command = this.commandManager.levelCommands[index];

            totalTime += command.time;
            this.sprites[index].setX(this.convertTimeToXPos(totalTime - currentTime));
        }
    }

    public convertTimeToXPos(time:number) {
        return time * 0.15;
    }

    public destroy() {
        this.container.destroy();
    }

    public destroySingle(index:number) {
        this.sprites[index].destroy();
        this.sprites.splice(index, 1);
    }
}