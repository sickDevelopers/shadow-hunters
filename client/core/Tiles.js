import { _ } from 'lodash';

export class LandTile {

    constructor(args) {

        if (!args) {
            args = {};
            this.type = 'random';
        }

        Object.assign(this, args);
        if (!this.game) {
            throw new Error('Game needed');
        }

        this.path = LandTile.LAND_PATHS[Object.keys(LandTile.LAND_PATHS)[_.random(Object.keys(LandTile.LAND_PATHS).length - 1)]];
    }

    // torna l'eroe se è occupato
    isOccupied() {
        for (let i = 0; i < this.game.enemies.length; i++) {
            if (this.game.enemies[i].position.x === this.indexX && this.game.enemies[i].position.y === this.indexY) {
                return this.game.enemies[i];
            }
        }
        return undefined;
    }

}

LandTile.LAND_PATHS = {};
LandTile.LAND_PATHS.LAND_1 = 'land_1';
LandTile.LAND_PATHS.LAND_2 = 'land_2';
LandTile.LAND_PATHS.LAND_3 = 'land_3';
LandTile.LAND_PATHS.LAND_4 = 'land_4';
