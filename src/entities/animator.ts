class Animator {

    public actor:Actor;
    public sprite:Phaser.GameObjects.Sprite;
    private scene:Phaser.Scene;

    public get facingDirection():number { return this.sprite.flipX ? -1 : 1; }
    public set facingDirection(dir:number) { this.sprite.flipX = dir < 0; }

    private currentSquish: { timer:number, startTime:number, reverseTime:number, scaleX:number, scaleY:number } = { timer: 0, startTime: 0, reverseTime: 0, scaleX: 1, scaleY: 1 };
    public get isSquishing(): boolean { return this.currentSquish.timer > 0; }

    constructor(scene:Phaser.Scene, sprite: Phaser.GameObjects.Sprite, actor: Actor) {
        this.scene = scene;
        this.sprite = sprite;
        this.actor = actor;
    }

    public update() {
        if (this.isSquishing) {
            this.updateSquish();
        }
    }
    public updatePosition() {
        this.sprite.setPosition(this.actor.hitbox.centerX, this.actor.hitbox.centerY);
    }

    public changeAnimation(key:string, isSingleFrame:boolean = false) {
        if (isSingleFrame) {
            this.sprite.anims.stop();
            this.sprite.setFrame(key);
        }
        else {
            this.sprite.play(key);
            this.setTimeScale(1);
        }
    }
    public setTimeScale(timeScale:number) {
        this.sprite.anims.setTimeScale(timeScale);
    }
    public createAnimation(key:string, texture:string, prefix:string, length:number, frameRate:number = 16, repeat:number = -1) {
        let frameNames = this.scene.anims.generateFrameNames(texture, { 
            prefix: prefix,
            suffix: '.png',
            end: length - 1,
            zeroPad: 2
        });
        this.scene.anims.create({
            key: key,
            frames: frameNames,
            frameRate: frameRate,
            repeat: repeat,
        });
    }

    public squish(scaleX: number, scaleY: number, duration: number, reverseTime?: number) {
        this.currentSquish = {
            timer: duration,
            reverseTime: reverseTime == undefined ? duration / 2 : reverseTime,
            startTime: duration,
            scaleX: scaleX,
            scaleY: scaleY
        }
    }
    protected updateSquish()
    {
        this.currentSquish.timer = Math.max(this.currentSquish.timer - GameTime.getElapsedMS(), 0);
        let timeToReverse = this.currentSquish.startTime - this.currentSquish.reverseTime;

        if (this.currentSquish.timer > timeToReverse) {
            let t = 1 - (this.currentSquish.timer - timeToReverse) / this.currentSquish.reverseTime;

            this.sprite.scaleX = Phaser.Math.Linear(1, this.currentSquish.scaleX, t);
            this.sprite.scaleY = Phaser.Math.Linear(1, this.currentSquish.scaleY, t);
        }
        else {
            let t = 1 - this.currentSquish.timer / timeToReverse;

            this.sprite.scaleX = Phaser.Math.Linear(this.currentSquish.scaleX, 1, t);
            this.sprite.scaleY = Phaser.Math.Linear(this.currentSquish.scaleY, 1, t);
        }
    }

    public destroy() {
        this.sprite.destroy();
    }
}