/// <reference path="./player_airborne_state.ts"/>

class PlayerJumpState extends PlayerAirborneState {

    constructor(player:Player) {
        super(player);
    }

    public enter() {
        this.player.speed.y = -24;
    }

    public update() {

    }

    public leave() {

    }
}