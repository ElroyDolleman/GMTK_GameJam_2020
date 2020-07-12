enum ExplosionTypes {
    Small = 1,
    Big = 2,
}

class Explosion extends Actor {

    public damageCircle:Phaser.Geom.Circle;
    public animation:Animator;

    public get canDamage():boolean { return this.animation.sprite.anims.currentFrame.index < 4; };
    public dead:boolean = false;

    constructor(scene:Phaser.Scene, x:number, y:number, radius:number, explosionType:ExplosionTypes) {
        super(new Phaser.Geom.Rectangle(x, y, 0, 0));

        this.animation = new Animator(
            scene,
            scene.add.sprite(x, y, 'effects_sheet', 'explosion_00.png'),
            this
        );
        this.animation.createAnimation(this.getAnim(ExplosionTypes.Small), 'effects_sheet', 'explosion' + ExplosionTypes.Small + '_', 6, 14, 0);
        this.animation.createAnimation(this.getAnim(ExplosionTypes.Big), 'effects_sheet', 'explosion' + ExplosionTypes.Big + '_', 6, 16, 0);
        this.animation.addOnCompleteCallback(this.animationDone, this);

        this.animation.sprite.setOrigin(0.5, 0.5);

        this.replay(x, y, radius, explosionType);
    }

    public replay(x:number, y:number, radius:number, explosionType:ExplosionTypes) {
        this.damageCircle = new Phaser.Geom.Circle(x, y, radius);

        this.animation.sprite.x = x;
        this.animation.sprite.y = y;
        this.animation.changeAnimation(this.getAnim(explosionType));
        this.animation.sprite.setVisible(true);

        this.dead = false;
    }

    private getAnim(explosionType:ExplosionTypes):string {
        return 'boom_' + explosionType;
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