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
        this.animation.createAnimation('boom', 'effects_sheet', 'explosion_', 6, 16, 0);
        this.animation.addOnCompleteCallback(this.animationDone, this);
        this.animation.sprite.setOrigin(0.5, 0.5);

        this.replay(x, y, radius);
    }

    public replay(x:number, y:number, radius:number) {
        this.damageCircle = new Phaser.Geom.Circle(x, y, radius);

        this.animation.sprite.setVisible(true);
        this.animation.changeAnimation('boom');
    }

    private animationDone() {
        this.dead = true;
        this.animation.sprite.setVisible(false);
    }

    public overlaps(actor:Actor):boolean {
        return Phaser.Geom.Intersects.CircleToRectangle(this.damageCircle, actor.hitbox);
    }

    private destroy() {
        this.animation.destroy();
    }
}