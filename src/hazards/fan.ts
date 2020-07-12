class Fan extends Actor {

    public animation:Animator;
    public rotation:number;

    //private debug:Phaser.GameObjects.Graphics;

    private defaultBlowPower:number = 400;
    public get blowSpeedX():number {
        if (this.rotation == 90) return this.defaultBlowPower;
        if (this.rotation == 270) return -this.defaultBlowPower;
        return 0;
    }
    public get blowSpeedY():number {
        if (this.rotation == 0) return -this.defaultBlowPower;
        if (this.rotation == 180) return this.defaultBlowPower;
        return 0;
    }

    constructor(scene:Phaser.Scene, x:number, y:number, rotation:number) {
        super(new Phaser.Geom.Rectangle(x, y, 16, 16));
        this.rotation = rotation;

        if (this.rotation == 90) this.x -= 16;

        this.animation = new Animator(
            scene,
            scene.add.sprite(x + 0, y + 0, 'levelobjects_sheet', 'fan_00.png'),
            this
        );
        this.animation.sprite.setOrigin(0, 0);
        this.animation.sprite.setRotation(Phaser.Math.DegToRad(rotation));
        this.animation.createAnimation('rotate', 'levelobjects_sheet', 'fan_', 2, 8);
        this.animation.changeAnimation('rotate');

        // this.debug = scene.add.graphics({ fillStyle: { color: 0xFF, alpha: 0.3 } });
        // this.debug.fillRectShape(this.hitbox);
    }
}