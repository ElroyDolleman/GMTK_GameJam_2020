/// <reference path="../entities/actor.ts"/>

class Player extends Actor {

    private view:PlayerView;
    public controller:PlayerController;

    public currentState:PlayerBaseState;
    public groundedState:PlayerGroundedState;
    public airborneState:PlayerAirborneState;

    constructor(scene:Phaser.Scene, startX:number, startY:number) {
        super(new Phaser.Geom.Rectangle(startX, startY, 16, 32));

        this.view = new PlayerView(scene, this);
        this.controller = new PlayerController(this);

        this.initStates();
    }

    initStates() {
        this.groundedState = new PlayerGroundedState(this);
        this.airborneState = new PlayerAirborneState(this);

        this.currentState = this.groundedState;
    }

    update() {
        this.currentState.update();
    }

    lateUpdate() {
        this.view.updateVisuals();
    }

    onCollisionSolved(result:CollisionResult) {
        this.currentState.onCollisionSolved(result);
    }

    public changeState(newState:PlayerBaseState) {
        this.currentState.leave();
        this.currentState = newState;
        this.currentState.enter();
    }

    public moveLeft(maxRunSpeed:number, runAcceleration:number) {
        if (this.speed.x > -maxRunSpeed) {
            this.speed.x = Math.max(this.speed.x - runAcceleration, -maxRunSpeed);
        }
        else if (this.speed.x < -maxRunSpeed) {
            this.speed.x = Math.min(this.speed.x + runAcceleration, -maxRunSpeed);
        }
    }

    public moveRight(maxRunSpeed:number, runAcceleration:number) {
        if (this.speed.x < maxRunSpeed) {
            this.speed.x = Math.min(this.speed.x + runAcceleration, maxRunSpeed);
        }
        else if (this.speed.x > maxRunSpeed) {
            this.speed.x = Math.max(this.speed.x - runAcceleration, maxRunSpeed);
        }
    }

    public decelerate(deceleration:number) {
        if (Math.abs(this.speed.x) < deceleration) {
            this.speed.x = 0;
        }
        else {
            this.speed.x -= deceleration * MathHelper.sign(this.speed.x);
        }
    }

    destroy() {
        this.view.destroy();
    }
}