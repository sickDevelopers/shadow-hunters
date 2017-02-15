import { LandTile } from '../core/Tiles';
import { Wizard } from '../core/Heroes';
import { _ } from 'lodash';

const BootState = {

    preload() {

        this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));

        this.game.load.image('land_1', 'assets/land_1.png');
        this.game.load.image('land_2', 'assets/land_2.png');
        this.game.load.image('land_3', 'assets/land_3.png');
        this.game.load.image('land_4', 'assets/land_4.png');

        this.game.load.image('wizard_1', 'assets/wizard_1.png');
        this.game.load.image('warrior_1', 'assets/warrior_1.png');

        this.game.load.image('target_1', 'assets/target.png');

        this.game.iso.anchor.setTo(0.5, 0.2);

        this.game.stage.backgroundColor = '#ffeeee';
        // pixel perfect
        this.game.renderer.renderSession.roundPixels = true;

        this.tileEdge = 38;

        this.ghost = undefined;
        this.target = undefined;

    },

    create() {

        // Create a group for our tiles.
        this.landGroup = this.game.add.group();
        this.landEventsGroup = this.game.add.group();
        this.heroesGroup = this.game.add.group();
        this.enemyGroup = this.game.add.group();
        this.targetGroup = this.game.add.group();

        // Provide a 3D position for the cursor
        this.cursorPos = new Phaser.Plugin.Isometric.Point3();

        this.selected = undefined;

        this.game.heroes = [{
            type: 'hero',
            _id: 'WIZ1',
            tile: 'wizard_1',
            range: 5,
            movement: 2,
            sprite: {},
            health: 4,
            'actions_left': 2,
            'base_actions': 2,
            weapon: {
                name: 'fireball',
                damage: '5'
            },
            position: {
                x: 2,
                y: 0
            }
        }, {
            type: 'hero',
            _id: 'WIZ2',
            tile: 'wizard_1',
            range: 5,
            'actions_left': 2,
            'base_actions': 2,
            weapon: {
                name: 'fireball',
                damage: '5'
            },
            movement: 2,
            sprite: {},
            health: 4,
            position: {
                x: 7,
                y: 2
            }
        },{
            type: 'hero',
            _id: 'WIZ3',
            tile: 'wizard_1',
            'actions_left': 2,
            'base_actions': 2,
            range: 5,
            weapon: {
                name: 'fireball',
                damage: '5'
            },
            movement: 2,
            health: 4,
            sprite: {},
            position: {
                x: 3,
                y: 6
            }
        }];

        this.game.enemies = [{
            type: 'hero',
            _id: 'WAR1',
            tile: 'warrior_1',
            range: 1,
            weapon: {
                name: 'sword',
                damage: 3
            },
            movement: 3,
            sprite: {},
            health: 6,
            position: {
                x: 4,
                y: 0
            }
        }, {
            type: 'hero',
            _id: 'WAR2',
            tile: 'warrior_1',
            range: 1,
            weapon: {
                name: 'sword',
                damage: 3
            },
            movement: 3,
            health: 6,
            sprite: {},
            position: {
                x: 6,
                y: 2
            }
        }];

        this.buildWorldMatrix(10);

        this.spawnHeroes();

        this.spawnEnemies();

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
                sprite.anchor.set(0.5, 0);
                sprite.inputEnabled = true;
                sprite.input.pixelPerfectClick = true;

                sprite.events.onInputDown.add(s => {

                    if (this.selected) {

                        let occupier = this.worldMatrix[x][y].isOccupied();
                        if (occupier) {
                            console.log('attack ', occupier);

                            return;
                        }

                        var distance = this.findDistance(
                            [x, y],
                            [this.selected.position.x, this.selected.position.y]
                            );

                        if (distance > 0 && distance <= this.selected.movement) {
                            // drop hero
                            console.log('drop hero');
                            if (this.ghost !== undefined) {
                                this.ghost.kill();
                                this.ghost = undefined;
                            }

                            // EFFETTUA MOVIMENTO
                            if (this.selected.actions_left > 0) {
                                this.selected.position.x = x;
                                this.selected.position.y = y;
                                this.game.add.tween(this.selected.sprite).to({ isoX: xx, isoY: yy, isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                                this.selected.actions_left -= 1;

                                if (this.selected.actions_left === 0) {
                                    console.log('no actions left, deselect');
                                    this.selected.sprite.tint = 0xffffff;
                                    this.game.add.tween(this.selected.sprite).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                                    this.selected = undefined;
                                }

                                if (this.isEndTurn()) {
                                    console.log('endTurn');
                                }
                            }

                        }

                    }
                });

                this.worldMatrix[x][y] = new LandTile({
                    game: this.game,
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

                let inBounds = tile.sprite.isoBounds.containsXY(this.cursorPos.x, this.cursorPos.y);

                if (!tile.sprite.selected && inBounds) {
                    tile.sprite.selected = true;
                    tile.sprite.tint = 0x86bfda;

                    if (this.selected && !this.isEndTurn()) {
                        var distance = this.findDistance(
                            [tile.indexX, tile.indexY],
                            [this.selected.position.x, this.selected.position.y]
                            );

                        if (distance > 0 && distance <= this.selected.movement) {

                            let occupier = this.worldMatrix[tile.indexX][tile.indexY].isOccupied();
                            if (occupier) {
                                // PUNTAMENTO NEMICO

                                if (this.ghost !== undefined) {
                                    this.ghost.kill();
                                    this.ghost = undefined;
                                }

                            } else {
                                // MOVIMENTO POSSIBILE
                                if (this.ghost === undefined) {
                                    this.ghost = this.game.add.isoSprite(tile.indexX * this.tileEdge, tile.indexY * this.tileEdge, 0, 'wizard_1', 0, this.heroesGroup);
                                    this.ghost.alpha = 0.5;
                                    this.ghost.anchor.set(0.5, 0.5);
                                } else {
                                    this.ghost.isoX = tile.indexX * this.tileEdge;
                                    this.ghost.isoY = tile.indexY * this.tileEdge;
                                }
                            }

                        } else {
                            if (this.ghost !== undefined) {
                                this.ghost.kill();
                                this.ghost = undefined;
                            }
                            if (this.target !== undefined) {
                                this.target.kill();
                                this.target = undefined;
                            }

                        }

                        if (distance > 0 && distance <= this.selected.range) {

                            let occupier = this.worldMatrix[tile.indexX][tile.indexY].isOccupied();
                            if (occupier) {
                                // ADD TARGET TO ENEMY
                                this.target = this.game.add.isoSprite(tile.indexX * this.tileEdge, tile.indexY * this.tileEdge, 0, 'target_1', 0, this.targetGroup);
                                this.target.anchor.set(0.5, 0.5);
                            }

                        }

                    }

                }
                // If not, revert back to how it was.
                else if (tile.sprite.selected && !inBounds) {
                    tile.sprite.selected = false;

                    tile.sprite.tint = 0xffffff;
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

        return Math.max(x, y);

        // return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

    },

    spawnHeroes() {

        this.game.heroes.map(hero => {

            let tile = this.game.add.isoSprite(this.tileEdge * hero.position.x, this.tileEdge * hero.position.y, 0, hero.tile, 0, this.heroesGroup);
            tile.hero = hero;
            tile.inputEnabled = true;
            tile.input.pixelPerfectOver = true;

            tile.events.onInputDown.add(s => {

                // se è già stato selezionato qualcosa
                if (this.selected) {

                    this.selected.sprite.tint = 0xffffff;
                    this.game.add.tween(this.selected.sprite).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);

                    // se sto ricliccando sull'eroe già selezionato
                    if (this.selected == s.hero) {
                        console.log('deselect');

                        this.selected = undefined;
                        return;
                    }

                }

                this.selected = s.hero;

                s.hero.sprite.tint = 0x86bfda;
                this.game.add.tween(s.hero.sprite).to({ isoZ: 4 }, 200, Phaser.Easing.Quadratic.InOut, true);

            });

            tile.anchor.set(0.5, 0.5);

            hero.sprite = tile;
            return hero;
        });

    },

    spawnEnemies() {
        this.game.enemies.map(enemy => {

            let tile = this.game.add.isoSprite(this.tileEdge * enemy.position.x, this.tileEdge * enemy.position.y, 0, enemy.tile, 0, this.enemyGroup);
            tile.enemy = enemy;
            tile.inputEnabled = true;
            tile.input.pixelPerfectOver = true;

            tile.events.onInputDown.add(s => {

                // se è già stato selezionato qualcosa
                if (this.selected) {

                    if (this.selected.actions_left > 0) {

                        this.selected.actions_left -= 1;
                        /************************************

                        ATTACK

                        ************************************/
                        let damage = Math.ceil(Math.random() * this.selected.weapon.damage + 2) - 3;
                        console.log('damage', damage);

                        if (damage <= 0) {
                            console.log('MISS');
                        } else {
                            enemy.health -= damage;
                            if (enemy.health <= 0) {
                                console.log('enemy killed');
                                tile.kill();
                                _.remove(this.game.enemies, e => {
                                    return e._id === enemy._id;
                                });

                                this.checkVictory();

                            }
                        }

                        if (this.target !== undefined) {
                            this.target.kill();
                            this.target = undefined;
                        }

                        if (this.selected.actions_left === 0) {
                            console.log('no actions left, deselect');
                            this.selected.sprite.tint = 0xffffff;
                            this.game.add.tween(this.selected.sprite).to({ isoZ: 0 }, 200, Phaser.Easing.Quadratic.InOut, true);
                            this.selected = undefined;
                        }

                        if (this.isEndTurn()) {
                            console.log('endTurn');
                        }
                    }

                }

            });

            tile.anchor.set(0.5, 0.5);

            enemy.sprite = tile;
            return enemy;
        });
    },

    checkVictory() {
        if (this.enemyGroup.total === 0) {
            console.log('VICTORY');
        }
    },

    isEndTurn() {
        let actionsLeft = this.game.heroes.reduce((acc, next) => {
            return acc + next.actions_left;
        }, 0);
        return actionsLeft <= 0;
    }

};

module.exports = BootState;
