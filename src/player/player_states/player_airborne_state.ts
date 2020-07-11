/// <reference path="./player_base_state.ts"/>

class PlayerAirborneState extends PlayerBaseState {

    constructor(player:Player) {
        super(player);
    }

    public enter() {
        this.updateAnim();
    }

    public update() {
        let prevSpeedY = this.player.speed.y;

        this.player.controller.updateMovementControls();
        this.updateGravity();

        if (MathHelper.sign(prevSpeedY) != MathHelper.sign(this.player.speed.y)) {
            this.updateAnim();
        }
    }

    public leave() {

    }

    public updateGravity(gravity:number = 16, maxFallSpeed:number = 220) {
        if (this.player.speed.y < maxFallSpeed) {
            this.player.speed.y = Math.min(this.player.speed.y + gravity, maxFallSpeed);
        }
    }

    public onCollisionSolved(result:CollisionResult) {
        if (result.onBottom) {
            this.player.speed.y = 0;
            this.player.view.animator.squish(1, 0.9, 100);
            this.player.changeState(this.player.groundedState);
        }
        else if (result.onTop) {
            this.player.speed.y = 0;
        }
    }

    private updateAnim() {
        if (this.player.speed.y < 0) {
            this.player.view.changeAnimation(PlayerAnimations.Jump);
        }
        else if (this.player.speed.y >= 0) {
            this.player.view.changeAnimation(PlayerAnimations.Fall);
        }
    }
}