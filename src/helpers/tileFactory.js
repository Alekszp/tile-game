
import { v4 as uuidv4 } from 'uuid';
import tileTypes from "@/const/tileTypes"
import tileTypeColors from "@/const/tileTypeColors"

export class DefaultTile {
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

export class Factory {
    constructor() {
        this.createInstance = function (type) {
            let tile = new DefaultTile(type)
            tile.id = uuidv4()

            return tile
        }
    }
}

