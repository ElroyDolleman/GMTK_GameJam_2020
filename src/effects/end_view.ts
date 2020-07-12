class EndView {

    private graphics: Phaser.GameObjects.Graphics;
    private scene:Phaser.Scene;

    private topText:Phaser.GameObjects.Text;
    private bottomText:Phaser.GameObjects.Text;
    private timeText:Phaser.GameObjects.Text;

    constructor(scene:Phaser.Scene) {
        this.scene = scene;

        let time = GameTime.getTimeDifferenceMSMM(GameTime.startTime, GameTime.endTime);
        let timeString = '';
        if (time.minutes > 0) {
            timeString += time.minutes.toString() + 'm ';
        }
        timeString += time.seconds.toString() + 's ';
        timeString += time.milliseconds.toString() + 'ms';
        
        this.topText = scene.add.text(320/2, 100, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '32px',
        });
        this.bottomText = scene.add.text(320/2, 160, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '16px',
        });
        this.timeText = scene.add.text(320/2, 300, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '10px',
        });

        this.timeText.text = timeString;
        this.topText.text = "The End!";
        this.bottomText.text = "Thanks for playing :)";

        this.timeText.depth = 69+1;
        this.topText.depth = 69+1;
        this.bottomText.depth = 69+1;

        this.timeText.setOrigin(0.5, 0.5);
        this.topText.setOrigin(0.5, 0.5);
        this.bottomText.setOrigin(0.5, 0.5);
    }
}