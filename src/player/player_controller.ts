class PlayerController {

    private player:Player;
    constructor(player:Player) {
        this.player = player;
    }

    public updateMovementControls(maxRunSpeed:number = 110, runAcceleration:number = 20) {
        if (inputManager.leftDown) {
            this.player.moveLeft(maxRunSpeed, runAcceleration);
        }
        else if (inputManager.rightDown) {
            this.player.moveRight(maxRunSpeed, runAcceleration);
        }
        else {
            this.player.decelerate(runAcceleration);
        }
    }

    public jumpCommand() {
        audioManager.sounds.blast.play();

        this.player.view.changeAnimation(PlayerAnimations.Jump);
        this.player.speed.y = -320;
        this.player.changeState(this.player.airborneState);
    }

    public shootRocketCommand() {
        audioManager.sounds.shoot.play();

        let dir = this.player.view.animator.facingDirection;
        let xpos = this.player.hitbox.centerX - ProjectileTypes.playerRocket.width / 2;
        this.player.level.addProjectile(
            ProjectileTypes.playerRocket, 
            xpos + (8 * dir),
            this.player.hitbox.centerY - 3,
            200 * dir,
            0
        );
    }
}