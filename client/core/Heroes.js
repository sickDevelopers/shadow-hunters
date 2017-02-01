import { _ } from 'lodash';

class Hero {
    constructor() {}
}

export class Wizard extends Hero {

    constructor() {
        super();
        this.tilePath = Hero.TILE_PATHS.WIZARD_1;
    }

}

Hero.TILE_PATHS = {};
Hero.TILE_PATHS.WIZARD_1 = 'wizard_1';
