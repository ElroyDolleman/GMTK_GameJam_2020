class ScreenTransition {
    
    private graphics: Phaser.GameObjects.Graphics;
    private scene:Phaser.Scene;

    public get active():boolean { return this.graphics.visible; };

    constructor(scene:Phaser.Scene) {
        this.scene = scene;
        
        this.createGraphics();
    }

    createGraphics() {
        this.graphics = this.scene.add.graphics({ lineStyle: { width: 2, color: 0x0 }, fillStyle: { color: 0x0, alpha: 1 } });
        this.graphics.depth = 69;
        this.graphics.clear();

        let left = -10;
        let right = 380;
        let points = [{x:left, y:0}];

        for (let y = 320 / 8; y <= 320; y += 320 / 8) {
            points.push({x:left, y});
            left -= 20;
            points.push({x:left, y});
        }
        for (let y = 320; y >= 0; y -= 320 / 8) {
            points.push({x:right, y});
            right += 20;
            points.push({x:right, y});
        }

        this.graphics.fillPoints(points);
        this.graphics.x = 0;
    }

    public onLevelEnter() {
        this.scene.tweens.add({
            targets: this.graphics,
            props: { 
                x: { value: -560, duration: 900, ease: 'Linear' },
            },
            onComplete: this.onEnterComplete.bind(this)
        });
    }
    private onEnterComplete() {
        this.graphics.x = 560;
        this.graphics.setVisible(false);
    }

    public onLevelClose(onDone:Function, context:any) {
        this.graphics.setVisible(true);
        this.scene.tweens.add({
            targets: this.graphics,
            props: { 
                x: { value: 0, duration: 900, ease: 'Linear' },
            },
            onComplete: onDone.bind(context)
        });
    }

    public update() {

    }
}