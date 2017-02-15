import { Rooms } from '../../imports/Rooms';

const MenuState = {

    preload() {
        console.log('menu preload');
    },

    create() {
        console.log('menu create');

        // console.log(this.game.rooms);

        this.game.roomsCursor = Rooms.find({});

        this.game.rooms = [];
        // this.game.rooms = ['test'];

        this.addRoomButton();

        // const handle = Meteor.subscribe('rooms');
        // console.log(handle);

        // this.game.rooms.map((r, i) => {
        //     console.log(r, i);

        //     let t = this.game.add.text(20, (i * 40) + 10, 'Rooom', {fill: '#fff'});
        // });
        let game = this.game;
        let i = 0;

        this.game.roomsCursor.observe({
            added(doc) {
                console.log('added', doc);

                let buttonText  = 'Room ' + doc._id

                let text = game.add.text(20, (i * 40) + 10, buttonText, {fill: '#fff'});
                console.log(text);
                text.inputEnabled = true;

                let room = Object.assign({}, doc, {
                    sprite: text
                });
                room.sprite.events.onInputDown.add(() => {
                    console.log('click ', doc._id);
                });
                i++;
                game.rooms.push(doc);
            },
            changed() {
                console.log('changed');
            },
            removed() {
                console.log('removed');
            }
        });

    },

    addRoomButton() {
        this.game.add.button(200, 40, 'NEW ROOM', () => {
            console.log('click');
        });
    }

};

module.exports = MenuState;
