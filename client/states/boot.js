import { LandTile } from '../core/Tiles';
import { Wizard } from '../core/Heroes';

const BootState = {

    preload() {

        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));

        this.game.load.image('land_1', 'assets/land_1.png');
        this.game.load.image('land_2', 'assets/land_2.png');
        this.game.load.image('land_3', 'assets/land_3.png');
        this.game.load.image('land_4', 'assets/land_4.png');

        this.game.load.image('wizard_1', 'assets/wizard_1.png');

        this.game.iso.anchor.setTo(0.5, 0);

        this.tileEdge = 38;

    },

    create() {
        console.log('bootState create');

        // Create a group for our tiles.
        this.landGroup = this.game.add.group();
        this.heroesGroup = this.game.add.group();

        // Provide a 3D position for the cursor
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();

        this.heroes = [{
            tile: 'wizard_1',
            position: {
                x: 2,
                y: 0
            }
        }, {
            tile: 'wizard_1',
            position: {
                x: 7,
                y: 2
            }
        }];

        this.buildWorldMatrix(8);

        // Let's make a load of tiles on a grid.
        this.spawnTiles();

        this.spawnHeroes();

    },

    buildWorldMatrix(width) {
        this.worldMatrix = [...Array(width)].map(a => {
            return new Array(...(new Array(width)));
        });

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < width; y++) {
                this.worldMatrix[x][y] = new LandTile();
            }
        }

        console.log(this.worldMatrix);

    },

    update() {
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
        this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

        // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
        this.landGroup.forEach((tile) => {
            var inBounds = tile.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);
            // If it does, do a little animation and tint change.
            if (!tile.selected && inBounds) {
                tile.selected = true;
                tile.tint = 0x86bfda;
                // this.game.add.tween(tile).to({ isoZ: 2 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
            // If not, revert back to how it was.
            else if (tile.selected && !inBounds) {
                tile.selected = false;
                tile.tint = 0xffffff;
                this.game.add.tween(tile).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
            }
        });
    },

    spawnTiles() {

        for (let x = 0; x < this.worldMatrix.length * this.tileEdge; x += this.tileEdge) {
            for (let y = 0; y < this.worldMatrix.length * this.tileEdge; y += this.tileEdge) {

                let tileObj = this.worldMatrix[x / this.tileEdge][y / this.tileEdge];

                let tile = this.game.add.isoSprite(x, y, 0, tileObj.path, 0, this.landGroup);
                tile.anchor.set(0.5, 0);
            }
        }

    },

    spawnHeroes() {

        this.heroes.map(hero => {
            let tile = this.game.add.isoSprite(this.tileEdge * hero.position.x, this.tileEdge * hero.position.y, 0, hero.tile, 0, this.heroesGroup);
            tile.hero = hero;
            tile.inputEnabled = true;
            tile.events.onInputDown.add(s => {
                console.log('selected', s.hero);
            })

            tile.anchor.set(0.5, 0.5);
        });

    }

    // update() {
    //     console.log('upadate');
    // }

};

module.exports = BootState;
