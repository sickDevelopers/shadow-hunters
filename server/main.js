import { Meteor } from 'meteor/meteor';
import '../imports/Rooms.js';
import uuid from 'uuid';

Meteor.startup(() => {
    // code to run on server at startup

    Meteor.methods({

        getUniqueId() {
            return uuid.v4();
        }

    });

});
