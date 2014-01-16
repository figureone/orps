//
// Utility functions
//

var player = function () {
	return Players.findOne({ user_id: Meteor.userId() });
}

var game = function () {
	var me = player();
	return me && me.game_id;// && Games.findOne(me.game_id);
}


//
// Lobby template
// Shows active games with titles, descriptions, and number of players.
//

Template.lobby.show = function () {
	// Only show lobby if we're not in a game.
	return ! game();
};

Template.lobby.games = function () {
	var games = Games.find();
	return games;
}

// Template.lobby.waiting = function () {
// 	var players = Players.find({
// 		_id: { $ne: Session.get('player_id') },
// 		name: { $ne: '' },
// 		game_id: { $exists: false },
// 	});
// 	return players;
// }

Template.lobby.events({
	'click .game-join': function(event, template) {
		Meteor.call('join', this._id);
	}
});


//
// Games template
// Show details on a room in the lobby
//

Template.game.player_count = function () {
	var players_in_game = Players.find({ game_id: this._id }).count();
	return players_in_game;
}

//
// Staging template
//

Template.staging.show = function () {
	// Only show if user is logged in
	return Meteor.userId() && game();
}

Template.staging.events({
	'click .game-leave': function(event, template) {
		Meteor.call('leave', game());
	}
});

////////////////////////////////
////////////////////////////////
// Debug template REMOVE REMOVE
////////////////////////////////
Template.debug.debug_logged_in_users = function () {
	return Meteor.users.find();
}
Template.debug.players = function () {
	var players = Players.find();
	return players;
}
// END DEBUG REMOVE /////////////
////////////////////////////////
////////////////////////////////




//
// Client code
//

if (Meteor.isClient) {
}

//
// Server code
//

if (Meteor.isServer) {
	Meteor.startup(function () {
		// code to run on server at startup
	});
}
