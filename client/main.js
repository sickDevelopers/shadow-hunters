import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';

import  BootState  from './states/boot';

import '../node_modules/phaser-plugin-isometric/dist/phaser-plugin-isometric.js';
import './main.html';

Template.game.onCreated(function gameOnCreated() {


    let x = 640;
    let y = 400;

    let game = new Phaser.Game(x, y, Phaser.AUTO, 'test', null, true, false);

    game.state.add('boot', BootState);

    game.state.start('boot');

});
