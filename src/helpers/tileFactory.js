
import { v4 as uuidv4 } from 'uuid';
import tileTypes from "@/constants/tileTypes"
import tileTypeColors from "@/constants/tileTypeColors"

class DefaultTile {
    constructor(type) {
        this.color = tileTypeColors[type]
        this.type = tileTypes[type]
    }

    set setTileType(type) {
        this.color = tileTypeColors[type]
        this.type = tileTypes[type]
    }

    get getTileType() {
        return this.type
    }
}

export default class TileFactory {
    constructor() {
        this.createInstance = function (type) {
            let tile = new DefaultTile(type)
            tile.id = uuidv4()

            return tile
        }
    }
}

