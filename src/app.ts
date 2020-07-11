/// <reference path="scenes/game_scene.ts"/>

let config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scaleMode: 3,
    pixelArt: true,
    backgroundColor: '#5d5bff',
    title: "GMTK Game Jam 2020",
    version: "0.0.0",
    disableContextMenu: true,
    scene: [ GameScene ],
    fps: {
        target: 60,
        min: 60,
        forceSetTimeOut: true
    },
};

let game = new Phaser.Game(config);