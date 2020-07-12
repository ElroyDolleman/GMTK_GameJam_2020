class Projectile extends Actor {

    private sprite:Phaser.GameObjects.Sprite;

    constructor(sprite:Phaser.GameObjects.Sprite, x:number, y:number, width:number, height:number, speedX:number, speedY:number) {
        super(new Phaser.Geom.Rectangle(x, y, width, height));
        this.sprite = sprite;
        this.sprite.setOrigin(0.5, 0.5);
        this.sprite.x = this.hitbox.centerX;
        this.sprite.y = this.hitbox.centerY;

        this.speed.x = speedX;
        this.speed.y = speedY;

        if (this.speedDirectionX == 1) {
            this.sprite.flipX = false;
        }
        else if (this.speedDirectionX == -1) {
            this.sprite.flipX = true;
        }
    }

    public moveX() {
        if (this.reflectTurning < 1) {
            this.reflectTurning = Math.min(this.reflectTurning + GameTime.getElapsed() * 5, 1);
            this.speed.x = Phaser.Math.Linear(this.normalSpeed, this.backSpeed, this.reflectTurning);
            this.sprite.rotation = Phaser.Math.Linear(this.startRot, this.endRot, this.reflectTurning);
        }

        super.moveX();
        this.sprite.x = this.hitbox.centerX;
    }
    public moveY() {
        super.moveY();
        this.sprite.y = this.hitbox.centerY;
    }

    private reflectTurning:number = 1;
    private backSpeed:number;
    private normalSpeed:number;
    private startRot:number;
    private endRot:number;
    public hasReflected:boolean = false;
    public reflectBack() {
        if (this.reflectTurning < 1) return;
        this.hasReflected = true;
        this.normalSpeed = this.speed.x;
        this.backSpeed = this.speed.x * -1;
        this.startRot = this.sprite.rotation;
        this.endRot = this.sprite.rotation + Math.PI;
        this.reflectTurning = 0;
    }

    public destroy() {
        this.sprite.destroy();
    }
}