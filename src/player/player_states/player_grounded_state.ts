/// <reference path="./player_base_state.ts"/>

class PlayerGroundedState extends PlayerBaseState {

    constructor(player:Player) {
        super(player);
    }

    public enter() {
        this.updateAnim();
    }

    public update() {
        let prevSpeedX = this.player.speed.x;

        this.player.controller.updateMovementControls();

        if (MathHelper.sign(prevSpeedX) != MathHelper.sign(this.player.speed.x)) {
            this.updateAnim();
        }
    }

    public leave() {
        
    }

    public onCollisionSolved(result:CollisionResult) {
        if (!this.player.hasGroundUnderneath(result.tiles)) {
            this.player.changeState(this.player.airborneState);
        }
    }

    private updateAnim() {
        if (MathHelper.sign(this.player.speed.x) == 0) {
            this.player.view.changeAnimation(PlayerAnimations.Idle);
        }
        else {
            this.player.view.changeAnimation(PlayerAnimations.Run);
        }
    }
}