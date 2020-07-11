let TILE_WIDTH: number = 16;
let TILE_HEIGHT: number = 16;

module Inputs {
    //export let Up: Phaser.Input.Keyboard.Key;
    export let Left: Phaser.Input.Keyboard.Key;
    //export let Down: Phaser.Input.Keyboard.Key;
    export let Right: Phaser.Input.Keyboard.Key;

    export function initKeyInputs(scene:Phaser.Scene) {
        //Inputs.Up = scene.input.keyboard.addKey('up');
        Inputs.Left = scene.input.keyboard.addKey('left');
        //Inputs.Down = scene.input.keyboard.addKey('down');
        Inputs.Right = scene.input.keyboard.addKey('right');
    }
}