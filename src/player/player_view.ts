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

    private textureKey:string = 'player_sheet';

    constructor(scene:Phaser.Scene, player:Player) {
        this.player = player;

        this.sprite = scene.add.sprite(0, 0, this.textureKey, PlayerAnimations.Idle.key);
        this.sprite.setOrigin(0.5, 1);

        this.animator = new Animator(scene, this.sprite, this.player);
        this.createAnimations();
    }

    private createAnimations() {
        this.animator.createAnimation('walk', this.textureKey, 'player_walk_', 4);
        this.animator.createAnimation('jump', this.textureKey, 'player_jump_', 2);
        this.animator.createAnimation('fall', this.textureKey, 'player_fall_', 2);

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
    }

    destroy() {
        this.animator.destroy();
    }
}