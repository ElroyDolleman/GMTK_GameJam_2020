class PlayerController {

    private player:Player;
    constructor(player:Player) {
        this.player = player;
    }

    public updateMovementControls(maxRunSpeed:number = 110, runAcceleration:number = 24) {
        if (Inputs.Left.isDown) {
            this.player.moveLeft(maxRunSpeed, runAcceleration);
        }
        else if (Inputs.Right.isDown) {
            this.player.moveRight(maxRunSpeed, runAcceleration);
        }
        else {
            this.player.decelerate(runAcceleration);
        }

        //Temp
        if (Inputs.Up.isDown && this.player.airborneState != this.player.currentState) {
            this.jumpCommand();
        }
    }

    public jumpCommand() {
        this.player.speed.y = -320;
        this.player.changeState(this.player.airborneState);
    }
}