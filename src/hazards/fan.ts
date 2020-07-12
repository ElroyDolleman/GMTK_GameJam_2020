class Fan extends Actor {

    public animation:Animator;
    public rotation:number;

    //private debug:Phaser.GameObjects.Graphics;
    public emitter: Phaser.GameObjects.Particles.ParticleEmitter;

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

        this.createParticles(scene);
    }

    private createParticles(scene:Phaser.Scene) {
        this.emitter = particleManager.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 350, max: 400 },
            speed: { min: 15, max: 20 },
            angle: this.rotation - 90,
            frequency: 32,
            emitZone: { source: new Phaser.Geom.Rectangle(0, 0, 16, 16) },
            frame: dustFrames
        });
        //this.emitter.start();
        this.emitter.setPosition(this.x, this.y)
    }
}