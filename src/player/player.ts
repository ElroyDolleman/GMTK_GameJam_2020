/// <reference path="../entities/actor.ts"/>

class Player extends Actor {

    public level:Level;

    public view:PlayerView;
    public controller:PlayerController;

    public currentState:PlayerBaseState;
    public groundedState:PlayerGroundedState;
    public airborneState:PlayerAirborneState;

    public get isJumping():boolean {
        if (this.currentState == this.airborneState) {
            return this.speed.y < 0;
        }
        return false;
    }

    constructor(scene:Phaser.Scene, level:Level, startX:number, startY:number) {
        super(new Phaser.Geom.Rectangle(startX, startY, 16, 26));

        this.level = level;
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