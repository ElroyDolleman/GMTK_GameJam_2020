class StartView {

    private graphics: Phaser.GameObjects.Graphics;
    private scene:Phaser.Scene;

    private topText:Phaser.GameObjects.Text;
    private bottomText:Phaser.GameObjects.Text;

    constructor(scene:Phaser.Scene) {
        this.scene = scene;
        
        this.topText = scene.add.text(320/2, 100, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '14px',
        });

        this.topText.text = "Press any key to start";
        this.topText.depth = 69+1;
        this.topText.setOrigin(0.5, 0.5);

        if (scene.game.device.input.touch) {
            this.bottomText = scene.add.text(320/2, 160, 'text', {
                fontFamily: 'Arial',
                align: 'center',
                fontSize: '12px',
            });
            this.bottomText.text = "Or tap the screen";
            this.bottomText.depth = 69+1;
            this.bottomText.setOrigin(0.5, 0.5);
        }
    }

    public destroy() {
        this.topText.destroy();
        if (this.bottomText) this.bottomText.destroy();
    }
}