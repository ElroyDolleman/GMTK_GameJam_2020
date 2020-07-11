/// <reference path="./player_base_state.ts"/>

class PlayerGroundedState extends PlayerBaseState {

    constructor(player:Player) {
        super(player);
    }

    public enter() {

    }

    public update() {
        this.player.controller.updateMovementControls();
    }

    public leave() {
        
    }

    public onCollisionSolved(result:CollisionResult) {
        if (!this.player.hasGroundUnderneath(result.tiles)) {
            this.player.changeState(this.player.airborneState);
        }
    }
}