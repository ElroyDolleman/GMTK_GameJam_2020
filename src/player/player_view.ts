/// <reference path="../entities/animator.ts"/>
module PlayerAnimations
{
    export let Idle = { key: 'player_walk_00.png', isSingleFrame: true };
    
    export let Run = { key: 'walk', isSingleFrame: false };
    export let Jump = { key: 'jump', isSingleFrame: false };
    export let Fall = { key: 'fall', isSingleFrame: false };
}

class PlayerView {

    private sprite:Phaser.GameObjects.Sprite;
    private player:Player;
    private animator:Animator;

    private jetFireAnimation:Animator;

    private textureKey:string = 'player_sheet';

    constructor(scene:Phaser.Scene, player:Player) {
        this.player = player;

        this.sprite = scene.add.sprite(0, 0, this.textureKey, PlayerAnimations.Idle.key);
        this.sprite.setOrigin(0.5, 1);

        this.createAnimations(scene);
    }

    private createAnimations(scene:Phaser.Scene) {
        this.animator = new Animator(scene, this.sprite, this.player);
        this.animator.createAnimation('walk', this.textureKey, 'player_walk_', 4);
        this.animator.createAnimation('jump', this.textureKey, 'player_jump_', 2);
        this.animator.createAnimation('fall', this.textureKey, 'player_fall_', 2);

        let jetFireSprite = scene.add.sprite(0, 0, this.textureKey);
        jetFireSprite.setOrigin(0.5, 0);

        this.jetFireAnimation = new Animator(scene, jetFireSprite, this.player);
        this.jetFireAnimation.createAnimation('burn', this.textureKey, 'jet_fire_', 4);
        this.jetFireAnimation.changeAnimation('burn');

        this.changeAnimation(PlayerAnimations.Idle);
        this.updateVisuals();
    }

    public changeAnimation(animation:any) {
        this.animator.changeAnimation(animation.key, animation.isSingleFrame);
    }

    public updateVisuals() {
        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);

        if (this.player.speedDirectionX == 1) {
            this.sprite.flipX = false;
        }
        else if (this.player.speedDirectionX == -1) {
            this.sprite.flipX = true;
        }

        if (this.player.isJumping) {
            this.updateJetVisuals();
        }
        else if (this.jetFireAnimation.sprite.visible) {
            this.jetFireAnimation.sprite.setVisible(false);
        }
    }

    private updateJetVisuals() {
        if (!this.jetFireAnimation.sprite.visible) {
            this.jetFireAnimation.sprite.setVisible(true);
        }
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