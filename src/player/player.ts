/// <reference path="../entities/actor.ts"/>

class Player extends Actor {

    playerView:PlayerView;

    constructor(scene:Phaser.Scene, startX:number, startY:number) {
        super(new Phaser.Geom.Rectangle(startX, startY, 16, 32));
        this.playerView = new PlayerView(scene, this);
    }

    update() {
        
    }

    lateUpdate() {
        this.playerView.updatePosition();
    }
}