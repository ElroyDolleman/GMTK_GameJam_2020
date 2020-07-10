class LevelLoader {

    private jsonData:any;

    public readonly scene:Phaser.Scene;
    constructor(scene:Phaser.Scene) { 
        this.scene = scene;
    }

    public preloadLevelJson():void {
        this.scene.load.json('levels', 'assets/levels.json');
    }
    public preloadSpritesheets():void {
        this.scene.load.spritesheet('main_tileset', 'assets/main_tileset.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }
    public init() {
        this.jsonData = this.scene.cache.json.get('levels');
    }

    public create(name:string) {
        let levelJson = this.jsonData[name];
        let tilesetJson = this.jsonData[levelJson['tileset_name']];

        return new Level(
            this.createTilemap(levelJson, tilesetJson),
            levelJson['player_spawn']
        );
    }

    private createTilemap(levelJson:any, tilesetJson:any) {

        let gridCellsX:number = levelJson['gridCellsX'];
        let gridCellsY:number = levelJson['gridCellsY'];

        let tilesData:Array<number> = levelJson['tiles'];
        //let entitiesData:Array<number> = layers.entities['entities'];

        let tiles:Tile[] = [];

        for (let i = 0; i < tilesData.length; i++) {
            let tileId:number = tilesData[i];

            let cellX:number = i % gridCellsX;
            let cellY:number = Math.floor(i / gridCellsX);

            let posX:number = cellX * TILE_WIDTH;
            let posY:number = cellY * TILE_HEIGHT;

            let sprite = this.makeSprite(tileId, posX, posY, levelJson['tileset_name']);

            let hitbox = new Phaser.Geom.Rectangle(posX, posY, TILE_WIDTH, TILE_HEIGHT);
            tiles.push(new Tile(sprite, TileType.Empty, cellX, cellY, posX, posY, hitbox));
        }
        return new Tilemap(tiles, gridCellsX, gridCellsY, TILE_WIDTH, TILE_HEIGHT);
    }

    private getLayers(levelJson:any) {
        return {
            default: levelJson['layers'][0],
            entities: levelJson['entities'][0]
        }
    }

    private makeSprite(tileId:number, posX:number, posY:number, tilesetName:string):Phaser.GameObjects.Sprite {
        if (tileId < 0) {
            return null;
        }
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        return sprite;
    }
}