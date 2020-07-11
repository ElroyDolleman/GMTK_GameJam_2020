class Projectile extends Actor {

    private sprite:Phaser.GameObjects.Sprite;

    constructor(sprite:Phaser.GameObjects.Sprite, x:number, y:number, width:number, height:number) {
        super(new Phaser.Geom.Rectangle(x, y, width, height));
        this.sprite = sprite;
        sprite.setOrigin(0.5, 0.5);
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