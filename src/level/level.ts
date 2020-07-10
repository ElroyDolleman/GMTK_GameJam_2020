class Level
{
    public map:Tilemap;

    constructor(map:Tilemap) {
        this.map = map;
    }

    public destroy() {
        this.map.destroy();
    }
}