/// <reference path="../entities/actor.ts"/>

class Player extends Actor {

    public level:Level;

    public view:PlayerView;
    public controller:PlayerController;

    public currentState:PlayerBaseState;
    public groundedState:PlayerGroundedState;
    public airborneState:PlayerAirborneState;

    public dead:boolean = false;
    private deadTimer:number = 0;

    public get isJumping():boolean {
        if (this.currentState == this.airborneState) {
            return this.speed.y < 0;
        }
        return false;
    }

    constructor(scene:Phaser.Scene, level:Level, startX:number, startY:number) {
        super(new Phaser.Geom.Rectangle(startX, startY - 26, 16, 26));

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
        if (this.dead) {
            this.updateDead();
            return;
        }

        this.currentState.update();
    }

    lateUpdate() {
        this.view.updateVisuals();
    }

    updateDead() {
        if (this.speed.y < 240) {
            this.speed.y = Math.min(this.speed.y + 16, 240);
        }
        this.deadTimer += GameTime.getElapsedMS();
        if (this.deadTimer > 250) {
            this.deadTimer -= 250;

            let offsetX = 12 - Math.random() * 24;
            let offsetY = 12 - Math.random() * 24;
            this.level.addExplosion(this.hitbox.centerX + offsetX, this.hitbox.centerY + offsetY, 2, ExplosionTypes.Small);
        }
    }

    onCollisionSolved(result:CollisionResult) {
        if (this.dead) return;

        if (result.isDamaged) {
            this.die();
        }
        else {
            this.currentState.onCollisionSolved(result);
        }
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

    public die() {
        this.dead = true;
        this.view.changeAnimation(PlayerAnimations.Dead);
        this.speed.x = 0;
        if (this.speed.y < 0) this.speed.y = 0;

        this.level.addExplosion(this.hitbox.centerX, this.hitbox.centerY, 3, ExplosionTypes.Small);

        audioManager.sounds.lose.play();
    }

    destroy() {
        this.view.destroy();
    }
}