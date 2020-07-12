class LevelGoal extends Actor {

    goalAnimator: Animator;

    constructor(scene:Phaser.Scene, x:number, y:number) {
        super(new Phaser.Geom.Rectangle(x, y, 16, 16));
        this.goalAnimator = new Animator(
            scene,
            scene.add.sprite(x, y, 'levelobjects_sheet'),
            this
        );
        this.goalAnimator.createAnimation('idle', 'levelobjects_sheet', 'goal_', 2, 8);
        this.goalAnimator.changeAnimation('idle');
        this.goalAnimator.sprite.setOrigin(0, 0);
    }

    public update() {
        this.goalAnimator.updatePosition();
    }

    public overlaps(actor:Actor) {
        return Phaser.Math.Difference(this.hitbox.bottom, actor.hitbox.bottom) == 0 &&
            Phaser.Math.Difference(this.hitbox.centerX, actor.hitbox.centerX) < 12;
    }

    public destroy() {
        this.goalAnimator.destroy();
    }
}