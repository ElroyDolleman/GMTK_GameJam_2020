let inputManager:InputManager;
class InputManager {

    private leftKey:Phaser.Input.Keyboard.Key;
    private rightKey:Phaser.Input.Keyboard.Key;

    public leftDown:boolean = false;
    public rightDown:boolean = false;

    private scene:Phaser.Scene;
    public firstInputCallback:Function;

    constructor(scene:Phaser.Scene) {
        inputManager = this;
        this.scene = scene;

        this.leftKey = scene.input.keyboard.addKey('left');
        this.rightKey = scene.input.keyboard.addKey('right');
        scene.input.keyboard.on('keydown', this.firstInput, this);
    }

    private firstInput() {
        this.scene.input.keyboard.removeListener('keydown');
        this.firstInputCallback();
    }

    public update(scene:Phaser.Scene) {
        let pointer = scene.input.activePointer;
        let touchX = pointer.x;
        let pointerIsDown = pointer.isDown && scene.game.device.input.touch;

        let pointerLeftTouch = pointerIsDown && touchX < 320 / 2;
        let pointerRightTouch = pointerIsDown && touchX > 320 / 2;

        this.leftDown = (this.leftKey.isDown || pointerLeftTouch);
        this.rightDown = (this.rightKey.isDown || pointerRightTouch);

        if (!gameStarted) {
            if (pointerIsDown) {
                this.firstInput();
            }
        }
    }
}