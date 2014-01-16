//
// Utility functions
//

var player = function () {
	return Players.findOne(Session.get('player_id'));
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

// Template.lobby.waiting = function () {
// 	var players = Players.find({
// 		_id: { $ne: Session.get('player_id') },
// 		name: { $ne: '' },
// 		game_id: { $exists: false },
// 	});
// 	return players;
// }

//
// Games template
// Show details on a room in the lobby
//

Template.lobby.games = function () {
	var games = Games.find();
	return games;
}

//
// Staging template
//

Template.staging.show = function () {
	// Only show if user is logged in
	return Meteor.user() && game();
}


//
// Debug template
//

Template.debug.debug_logged_in_users = function () {
	console.log(Meteor.users.find());
	return Meteor.users.find();
}


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
