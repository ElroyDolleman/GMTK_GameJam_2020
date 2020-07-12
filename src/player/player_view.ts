/// <reference path="../entities/animator.ts"/>
module PlayerAnimations
{
    export let Idle = { key: 'player_walk_00.png', isSingleFrame: true };
    export let Dead = { key: 'player_dead_00.png', isSingleFrame: true };
    
    export let Run = { key: 'walk', isSingleFrame: false };
    export let Jump = { key: 'jump', isSingleFrame: false };
    export let Fall = { key: 'fall', isSingleFrame: false };
    export let Victory = { key: 'victory', isSingleFrame: false };
}

class PlayerView {

    private sprite:Phaser.GameObjects.Sprite;
    private player:Player;
    public animator:Animator;

    private jetFireAnimation:Animator;

    private textureKey:string = 'player_sheet';

    public landDustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;
    public jumpDustEmitter: Phaser.GameObjects.Particles.ParticleEmitter;

    constructor(scene:Phaser.Scene, player:Player) {
        this.player = player;

        this.sprite = scene.add.sprite(0, 0, this.textureKey, PlayerAnimations.Idle.key);
        this.sprite.setOrigin(0.5, 1);

        this.createAnimations(scene);        
    }

    private createAnimations(scene:Phaser.Scene) {
        this.animator = new Animator(scene, this.sprite, this.player);
        this.animator.createAnimation('walk', this.textureKey, 'player_walk_', 4);
        this.animator.createAnimation('jump', this.textureKey, 'player_jump_', 2, 10);
        this.animator.createAnimation('fall', this.textureKey, 'player_fall_', 2, 12);
        this.animator.createAnimation('victory', this.textureKey, 'player_victory_', 8, 16, 0);

        let jetFireSprite = scene.add.sprite(0, 0, this.textureKey);
        jetFireSprite.setOrigin(0.5, 0);

        this.jetFireAnimation = new Animator(scene, jetFireSprite, this.player);
        this.jetFireAnimation.createAnimation('burn', this.textureKey, 'jet_fire_', 4);
        this.jetFireAnimation.changeAnimation('burn');

        this.changeAnimation(PlayerAnimations.Idle);
        this.createParticles(scene);
        this.updateVisuals();
    }

    private createParticles(scene:Phaser.Scene) {
        this.landDustEmitter = particleManager.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 300, max: 400 },
            speed: { min: 4, max: 6 },
            angle: 270,
            frequency: -1,
            emitZone: { source: new Phaser.Geom.Rectangle(-6, -3, 12, 1) },
            frame: dustFrames
        });
        this.jumpDustEmitter = particleManager.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 200, max: 350 },
            speed: { min: 10, max: 15 },
            angle: 270,
            frequency: -1,
            emitZone: { source: new Phaser.Geom.Rectangle(-4, -3, 8, 1) },
            frame: dustFrames
        });
    }

    public playLandParticles() {
        this.landDustEmitter.explode(14, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    public playJumpParticles() {
        this.jumpDustEmitter.explode(8, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }

    public changeAnimation(animation:any) {
        this.animator.changeAnimation(animation.key, animation.isSingleFrame);

        if (animation.key == 'jump') {
            this.jetFireAnimation.sprite.setVisible(true);
        }
        else {
            this.jetFireAnimation.sprite.setVisible(false);
        }
    }

    public updateVisuals() {
        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);

        if (this.player.speedDirectionX == 1) {
            this.sprite.flipX = false;
        }
        else if (this.player.speedDirectionX == -1) {
            this.sprite.flipX = true;
        }

        // if (this.player.isJumping) {
        //     this.updateJetVisuals();
        // }
        // else
         if (this.jetFireAnimation.sprite.visible) {
            //this.jetFireAnimation.sprite.setVisible(false);
            this.updateJetVisuals();
        }

        this.animator.update();
    }

    private updateJetVisuals() {
        if (!this.sprite.flipX) {
            this.jetFireAnimation.sprite.setPosition(this.player.hitbox.centerX - 9, this.player.hitbox.bottom - 5);
        }
        else {
            this.jetFireAnimation.sprite.setPosition(this.player.hitbox.centerX + 10, this.player.hitbox.bottom - 5);
        }
    }

    destroy() {
        this.animator.destroy();
        this.jetFireAnimation.destroy();
    }
}