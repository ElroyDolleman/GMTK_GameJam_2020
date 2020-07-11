class Explosion extends Actor {

    public damageCircle:Phaser.Geom.Circle;
    public animation:Animator;

    public get canDamage():boolean { return this.animation.sprite.anims.currentFrame.index > 3; };
    public dead:boolean = false;

    constructor(scene:Phaser.Scene, x:number, y:number, radius:number) {
        super(new Phaser.Geom.Rectangle(x, y, 0, 0));

        this.animation = new Animator(
            scene,
            scene.add.sprite(x, y, 'effects_sheet', 'explosion_00.png'),
            this
        );
        this.animation.createAnimation('boom', 'effects_sheet', 'explosion_', 6, 14, 0);
        this.animation.addOnCompleteCallback(this.animationDone, this);
        this.animation.sprite.setOrigin(0.5, 0.5);

        this.replay(x, y, radius);
    }

    public replay(x:number, y:number, radius:number) {
        this.damageCircle = new Phaser.Geom.Circle(this.hitbox.centerX, this.hitbox.centerY, radius);

        this.animation.sprite.x = x;
        this.animation.sprite.y = y;
        this.animation.changeAnimation('boom');
        this.animation.sprite.setVisible(true);

        this.dead = false;
    }

    private animationDone() {
        this.dead = true;
        this.animation.sprite.setVisible(false);
    }

    public overlaps(actor:Actor):boolean {
        return Phaser.Geom.Intersects.CircleToRectangle(this.damageCircle, actor.hitbox);
    }

    public destroy() {
        this.animation.destroy();
    }
}