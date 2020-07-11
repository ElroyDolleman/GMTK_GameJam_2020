let commandEvents = {
    jump: 'jump',
}

class CommandManager {

    private view: CommandView;

    private commandEventEmitter:Phaser.Events.EventEmitter;
    private commandIndex:number = 0;
    private timer:number = 0;
    public levelCommands:any[];

    public get currentCommand():any { return this.levelCommands[this.commandIndex]; }

    constructor(scene:Phaser.Scene, levelName:string) {
        this.commandEventEmitter = new Phaser.Events.EventEmitter();
        this.levelCommands = scene.cache.json.get('commands')[levelName];

        this.view = new CommandView(this, scene);
    }

    public listenToCommand(command:string, callback:Function, context:any) {
        this.commandEventEmitter.addListener(command, callback, context);
    }

    public update() {
        this.timer += GameTime.getElapsedMS();
        if (this.timer >= this.currentCommand.time) {
            this.timer -= this.currentCommand.time;

            this.commandIndex = this.getNextCommandIndex();
            this.commandEventEmitter.emit(this.currentCommand.name);
        }

        this.view.update(this.timer);
    }

    public getNextCommandIndex(nextAmount:number = 1):number {
        return (this.commandIndex + nextAmount) % this.levelCommands.length
    }

    public getNextCommand(nextAmount:number = 1) {
        return this.levelCommands[this.getNextCommandIndex(nextAmount)];
    }

    public destroy() {
        this.commandEventEmitter.removeAllListeners();
        this.view.destroy();
    }
}