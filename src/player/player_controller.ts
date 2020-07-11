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
    }

    public jumpCommand() {
        this.player.speed.y = -320;
        this.player.changeState(this.player.airborneState);
    }

    public shootRocketCommand() {
        let dir = this.player.view.animator.facingDirection;
        let xpos = this.player.hitbox.centerX - ProjectileTypes.playerRocket.width / 2;
        this.player.level.addProjectile(
            ProjectileTypes.playerRocket, 
            xpos + (8 * dir),
            this.player.hitbox.centerY - 3,
            140 * dir,
            0
        );
    }
}