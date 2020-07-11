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
        super.moveX();
        this.sprite.x = this.hitbox.centerX;
    }
    public moveY() {
        super.moveY();
        this.sprite.y = this.hitbox.centerY;
    }

    public destroy() {
        this.sprite.destroy();
    }
}