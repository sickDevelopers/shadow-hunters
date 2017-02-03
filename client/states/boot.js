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

        // Create a group for our tiles.
        this.landGroup = this.game.add.group();
        this.heroesGroup = this.game.add.group();

        // Provide a 3D position for the cursor
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();

        this.selected = undefined;

        this.heroes = [{
            type: 'hero',
            _id: 'WIZ1',
            tile: 'wizard_1',
            range: 5,
            movement: 3,
            sprite: {},
            position: {
                x: 2,
                y: 0
            }
        }, {
            type: 'hero',
            _id: 'WIZ2',
            tile: 'wizard_1',
            range: 5,
            movement: 3,
            sprite: {},
            position: {
                x: 7,
                y: 2
            }
        },{
            type: 'hero',
            _id: 'WIZ3',
            tile: 'wizard_1',
            range: 5,
            movement: 3,
            sprite: {},
            position: {
                x: 3,
                y: 6
            }
        }];

        this.buildWorldMatrix(8);

        this.spawnHeroes();

    },

    buildWorldMatrix(width) {
        this.worldMatrix = [...Array(width)].map(a => {
            return new Array(...(new Array(width)));
        });

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < width; y++) {

                let xx = this.tileEdge * x;
                let yy = this.tileEdge * y;
                let sprite = this.game.add.isoSprite(xx, yy, 0, 'land_1', 0, this.landGroup);
                sprite.inputEnabled = true;

                sprite.events.onInputDown.add(s => {
                    var hasHero = _.find(this.heroes, h => {
                        return h.position.x === x && h.position.y === y;
                    });
                    if (hasHero) {

                        console.log('found something');
                    } else {
                        if (this.selected) {

                            let pathDistance = this.findDistance(
                                [this.selected.position.x, this.selected.position.y], [x, y]
                                );

                            if (pathDistance <= this.selected.movement) {
                                console.log('move to ', x, y);
                                let isoX = x * this.tileEdge;
                                let isoY = y * this.tileEdge;
                                this.game.add.tween(this.selected.sprite).to({ isoX, isoY, isoZ: 0 }, 400, Phaser.Easing.Quadratic.InOut, true);
                                this.selected.position.x = x;
                                this.selected.position.y = y;
                            } else {
                                console.log('cannot reach');
                            }

                        }
                    }

                });

                sprite.anchor.set(0.5, 0);

                this.worldMatrix[x][y] = new LandTile({
                    indexX: x,
                    indexY: y,
                    x: xx,
                    y: yy,
                    sprite: sprite
                });

            }
        }

    },

    update() {
        // Update the cursor position.
        // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
        // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
        this.game.iso.unproject(this.game.input.activePointer.position, this.cursorPos);

        this.worldMatrix.forEach((row, x) => {
            row.forEach((tile, y) => {

                let inBounds = inBounds = tile.sprite.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);

                if (!tile.sprite.selected && inBounds) {
                    tile.sprite.selected = true;
                    tile.sprite.tint = 0x86bfda;
                    // this.game.add.tween(tile).to({ isoZ: 2 }, 200, Phaser.Easing.Quadratic.InOut, true);
                }
                // If not, revert back to how it was.
                else if (tile.sprite.selected && !inBounds) {
                    tile.sprite.selected = false;

                    if (this.selected) {
                        let pos1 = [this.selected.position.x, this.selected.position.y];
                        let pos2 = [tile.indexX, tile.indexY];
                        let distance = this.findDistance(pos1, pos2);
                        if (distance < this.selected.movement) {
                            tile.sprite.tint = 0xff00ff;
                        } else {
                            tile.sprite.tint = 0xffffff;    
                        }
                    } else {
                        tile.sprite.tint = 0xffffff;
                    }

                    // this.game.add.tween(tile.sprite).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                }

            });
        });

        if (this.selected && this.selected.type === 'hero') {
            // console.log('hero selected');

        }

    },

    findDistance(obj1, obj2) {
        var x = Math.abs(obj2[0] - obj1[0]);
        var y = Math.abs(obj2[1] - obj1[1]);

        // return Math.max(x, y);

        return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    },

    spawnHeroes() {

        this.heroes.map(hero => {

            let tile = this.game.add.isoSprite(this.tileEdge * hero.position.x, this.tileEdge * hero.position.y, 0, hero.tile, 0, this.heroesGroup);
            tile.hero = hero;
            tile.inputEnabled = true;
            tile.events.onInputDown.add(s => {

                // se è già stato selezionato qualcosa
                if (this.selected) {

                    this.selected.sprite.tint = 0xffffff;
                    this.game.add.tween(this.selected.sprite).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);

                    // se sto ricliccando sull'eroe già selezionato
                    if (this.selected == s.hero) {
                        console.log('deselect');

                        // scorro la matrice e coloro di rosso i punti raggiungibili
                        this.worldMatrix.forEach((row, x) => {
                            row.forEach((tile, y) => {
                                let pos1 = [tile.indexX, tile.indexY];
                                let distance = this.findDistance(pos1, [this.selected.position.x, this.selected.position.y]);
                                if (distance < this.selected.range) {
                                    tile.sprite.tint = 0xffffff;
                                }
                            });
                        });

                        this.selected = undefined;
                        return;
                    }

                }

                this.selected = s.hero;

                s.hero.sprite.tint = 0x86bfda;
                this.game.add.tween(s.hero.sprite).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);

                // scorro la matrice e coloro di rosso i punti raggiungibili
                this.worldMatrix.forEach((row, x) => {
                    row.forEach((tile, y) => {
                        let pos1 = [tile.indexX, tile.indexY];
                        let distance = this.findDistance(pos1, [this.selected.position.x, this.selected.position.y]);
                        if (distance < this.selected.movement) {
                            tile.sprite.tint = 0xff00ff;
                        }
                    });
                });

            });

            tile.anchor.set(0.5, 0.5);

            hero.sprite = tile;
            return hero;
        });

    }

    // update() {
    //     console.log('upadate');
    // }

};

module.exports = BootState;
