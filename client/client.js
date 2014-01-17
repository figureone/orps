//
// Utility functions
//

var player = function () {
	return Players.findOne({ user_id: Meteor.userId() });
}

var game = function () {
	var me = player();
	return me && me.game_id && Games.findOne(me.game_id);
}

var round = function () {
	var me = player();
	return me && me.round_id && Rounds.findOne(me.round_id);
}

// true if the current user is playing (false if waiting and ready to start a round, or in lobby or not logged in)
var in_round = function () {
	var me = player();
	if (me && me.round_id) {
		var round = Rounds.findOne(me.round_id);
		if (round && round.state !== 'waiting') {
			return true;
		}
	}
	return false;
}

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
	// Only show if user is logged in, in a game room, but not playing in a round
	return Meteor.userId() && game() && !in_round();
}

Template.staging.chats = function () {
	var chats = Chats.find({ game_id: game() }, { sort: { 'timestamp': -1 }, limit: 5 });
	// we need to use reverse ordering to grab just the last few chats, but then we need to reverse the order again so the chats display oldest to newest. hence the mess below.
	var reverse_chats = new Array();
	chats.forEach( function (data) {
		reverse_chats.push(data);
	});
	reverse_chats.reverse();
	return reverse_chats;
}

Template.staging.game_name = function () {
	var me = player();
	var game = Games.findOne(me.game_id);
	return game.name;
}

Template.staging.game_description = function () {
	var me = player();
	var game = Games.findOne(me.game_id);
	return game.description;
}

Template.staging.events({
	'click .game-leave': function (event, template) {
		Meteor.call('leave', game());
	},
	'click .game-start': function (event, template) {
		$('.game-start').toggleClass('btn-primary').toggleClass('btn-success');

		if ($('.game-start').hasClass('btn-success') ) { // entered ready up state
			Meteor.call('ready', game());
		} else { // we've canceled our "ready up" state
			Meteor.call('not_ready');
		}
	},
	'keyup .staging-chat-input': function (event, template) {
		if ( event.which == 13) { // eventnter key
			event.preventDefault();
			var message = $('input.staging-chat-input').val().trim();
			Chats.insert({
				name: displayName(Meteor.user()),
				game_id: game(),
				message: message,
				timestamp: new Date().getTime(),
			});
			$('input.staging-chat-input').val('').focus();
		}
	}
});

//
// Chat template
//

Template.chat.timestamp_formatted = function () {
	var time = new Date(this.timestamp);
	if (time.getHours() > 12) {
		return time.getHours() - 12 + ':' + time.getMinutes() + 'pm';
	} else {
		return time.getHours() + ':' + time.getMinutes() + 'am';
	}
}

//
// ORPS template (in-game template)
//

Template.orps.show = function () {
	// Only show if user is playing in a round
	return in_round();
}


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
Template.debug.rounds = function () {
	var rounds = Rounds.find();
	return rounds;
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
