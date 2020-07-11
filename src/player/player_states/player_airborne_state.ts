/// <reference path="./player_base_state.ts"/>

class PlayerAirborneState extends PlayerBaseState {

    constructor(player:Player) {
        super(player);
    }

    public enter() {

    }

    public update() {
        this.player.controller.updateMovementControls();
        this.updateGravity();
    }

    public leave() {

    }

    public updateGravity(gravity:number = 16, maxFallSpeed:number = 240) {
        if (this.player.speed.y < maxFallSpeed) {
            this.player.speed.y = Math.min(this.player.speed.y + gravity, maxFallSpeed);
        }
    }

    onCollisionSolved(result:CollisionResult) {
        if (result.onBottom) {
            this.player.speed.y = 0;
            this.player.changeState(this.player.groundedState);
        }
        else if (result.onTop) {
            this.player.speed.y = 0;
        }
    }
}