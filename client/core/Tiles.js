import { _ } from 'lodash';

export class LandTile {

    constructor(args) {
        if (!args) {
            this.type = 'random';
        }

        this.path = LandTile.LAND_PATHS[Object.keys(LandTile.LAND_PATHS)[_.random(Object.keys(LandTile.LAND_PATHS).length -1 )]];
    }

}

LandTile.LAND_PATHS = {};
LandTile.LAND_PATHS.LAND_1 = 'land_1';
LandTile.LAND_PATHS.LAND_2 = 'land_2';
LandTile.LAND_PATHS.LAND_3 = 'land_3';
LandTile.LAND_PATHS.LAND_4 = 'land_4';
