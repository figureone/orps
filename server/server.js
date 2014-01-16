// Publish games.
// Meteor.publish('games', function() {
// 	return Games.find();
// });

// Publish players in a room.
// Meteor.publish('players', function(game_id) {
// 	check(game_id, String);
// 	return Players.find({ game_id: game_id });
// });

Meteor.methods({
	join: function(game_id) {
		Players.insert({
			name: displayName(Meteor.user()),
			game_id: game_id,
			user_id: Meteor.userId(),
		});
	},
	leave: function(game_id) {
		Players.remove({ user_id: Meteor.userId() });
	},
});

//
// Users
//

var contactEmail = function (user) {
	if (user.emails && user.emails.length) {
		return user.emails[0].address;
	}
	if (user.services && user.services.facebook && user.services.facebook.email) {
		return user.services.facebook.email;
	}
	return null;
};

var displayName = function (user) {
	if (user.profile && user.profile.name) {
		return user.profile.name;
	}
	if (user.google && user.google.name) {
		return user.google.name;
	}
	if (user.emails && user.emails.length > 0 && user.emails[0].address) {
		return user.emails[0].address;
	}
	return 'Default User';
};

