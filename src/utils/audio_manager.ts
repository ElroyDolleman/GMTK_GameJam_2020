let audioManager:AudioManager;

class AudioManager {

    public sounds:any;
    private defaultConfig:any = {
        mute: false,
        volume: 1,
        rate: 1,
        detune: 0,
        seek: 0,
        loop: false,
        delay: 0
    }

    constructor(scene:Phaser.Scene) {
        audioManager = this;

        scene.load.audio('explode_small', 'assets/audio/explode_small.wav');
        scene.load.audio('headbonk', 'assets/audio/headbonk.wav');
        scene.load.audio('teleport', 'assets/audio/teleport.wav');
        scene.load.audio('explode', 'assets/audio/explode.wav');
        scene.load.audio('landing', 'assets/audio/landing.wav');
        scene.load.audio('shoot', 'assets/audio/shoot.wav');
        scene.load.audio('blast', 'assets/audio/blast.wav');
        scene.load.audio('lose', 'assets/audio/lose.wav');
        scene.load.audio('hit', 'assets/audio/hit.wav');
        scene.load.audio('win', 'assets/audio/win.wav');
        scene.load.audio('background_music', 'assets/audio/background_music.wav');
    }

    public addSoundsToGame(scene:Phaser.Scene) {
        this.sounds = {
            explodeSmall: scene.sound.add('explode_small', this.defaultConfig),
            headbonk: scene.sound.add('headbonk', this.defaultConfig),
            teleport: scene.sound.add('teleport', this.defaultConfig),
            explode: scene.sound.add('explode', this.defaultConfig),
            landing: scene.sound.add('landing', this.defaultConfig),
            shoot: scene.sound.add('shoot', this.defaultConfig),
            blast: scene.sound.add('blast', this.defaultConfig),
            lose: scene.sound.add('lose', this.defaultConfig),
            hit: scene.sound.add('hit', this.defaultConfig),
            win: scene.sound.add('win', this.defaultConfig),
        };
    }

    public playMusic(scene:Phaser.Scene) {
        let music = scene.sound.add('background_music', {
            mute: false,
            volume: 0.12,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.play();
        console.log(music);
    }
}