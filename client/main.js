import {Template} from 'meteor/templating';
import {ReactiveVar} from 'meteor/reactive-var';
// import Cookies from 'browser-cookies';
import { Session } from 'meteor/session'
import moment from 'moment'

// import { Rooms } from '../imports/Rooms';

import PlayState  from './states/play';
import MenuState  from './states/menu';

import '../node_modules/phaser-plugin-isometric/dist/phaser-plugin-isometric.js';
import './main.html';

Template.game.onCreated(function gameOnCreated() {

    let x = 640;
    let y = 400;

    let game = new Phaser.Game(x, y, Phaser.AUTO, 'game');
    // game.rooms = Rooms.find({});

    // Build user session in cookies
    // if (Cookies.get('sh') !== null) {	
    //     console.log('cookies', Cookies.get('sh'));
    // } else {
    //     Cookies.set('sh', JSON.stringify({value: 'my cookie'}));
    // }
    // Session.set('startTime', moment().utc().format());
    console.log(Session.get('startTime'));

    // game.state.add('boot', BootState);
    game.state.add('menu', MenuState);
    game.state.add('play', PlayState);

    game.state.start('menu');
    // game.state.start('play');

});
