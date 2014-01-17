//
// Utility functions
//

var player = function () {
	return Players.findOne({ user_id: Meteor.userId() });
}

var get_player = function (id) {
	return Players.findOne({ _id: id } );
}

var game = function () {
	var me = player();
	return me && me.game_id && Games.findOne(me.game_id);
}

var current_round = function () {
	var me = player();
	return me && me.round_id && Rounds.findOne(me.round_id);
}

// true if the current user is playing (false if waiting and ready to start a round, or in lobby or not logged in)
var in_round = function () {
	var me = player();
	var round = me && me.round_id && Rounds.findOne(me.round_id);
	return round && round.status !== 'waiting';
}

// get the game state
var game_state = function () {
	var me = player();
	var round = me && me.round_id && Rounds.findOne(me.round_id);
	return round && round.status;
}

var displayName = function (user) {
	if (user.profile && user.profile.name) {
		return user.profile.name;
	}
	if (user.google && user.google.name) {
		return user.google.name;
	}
	if (user.emails && user.emails.length > 0 && user.emails[0].address) {
		var email = user.emails[0].address;
		var emailName = email.match(/^([^@]*)@/);
		return emailName ? emailName[1] : email;
	}
	if (user.name) {
		var shortName = user.name.match(/^([^@ ]*)[@ ]/);
		return shortName ? shortName[1] : user.name;
	}
	return 'Default User';
};

//
// Wrapper template
//

Template.wrapper.class_game_state = function () {
	var state = 'unknown';

	if ( ! Meteor.userId() )
		state = 'not-logged-in';
	else if ( ! game() )
		state = 'lobby';
	else if ( ! in_round() )
		state = 'staging';
	else if ( game_state() === 'loading' )
		state = 'loading';
	else if ( game_state() === 'writing' )
		state = 'writing';
	else if ( game_state() === 'answering' )
		state = 'answering';
	else if ( game_state() === 'results' )
		state = 'results';

	return 'game-state-' + state;
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
	// Only show if user is logged in, in a game room, but not playing in a round
	return Meteor.userId() && game() && !in_round();
}

Template.staging.chats = function () {
	var chats = Chats.find({ game_id: game()._id }, { sort: { 'timestamp': -1 }, limit: 5 });
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

Template.staging.btn_primary_or_success = function () {
	var round = current_round();
	return (round && round.status === 'done') ? 'btn-success' : 'btn-primary';
}

Template.staging.events({
	'click .game-leave': function (event, template) {
		Meteor.call('leave', game()._id);
	},
	'click .game-start': function (event, template) {
		$('.game-start').toggleClass('btn-primary').toggleClass('btn-success');

		if ($('.game-start').hasClass('btn-success') ) { // entered ready up state
			Meteor.call('ready', game()._id);
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
				game_id: game()._id,
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
		return time.getHours() - 12 + ':' + ('0' + time.getMinutes()).slice(-2) + 'pm';
	} else {
		return time.getHours() + ':' + ('0' + time.getMinutes()).slice(-2) + 'am';
	}
}

//
// ORPS template (in-game template)
//

Template.orps.show = function () {
	// Only show if user is playing in a round
	return in_round();
}

Template.orps.title = function () {
	var title = '';
	var round = current_round();
	if ( round.status === 'loading')
		title = 'Flight checks confirmed. Delivering EXAM... Oh no, asteroid spotted on a collision course!';
	else if ( round.status === 'writing')
		title = 'The EXAM was destroyed! We need to recreate it! Everyone, create a QUESTION!';
	else if ( round.status === 'answering')
		title = 'Let\'s make sure our questions are good enough! Answer your teammate\'s QUESTIONS!';
	else if ( round.status === 'results')
		title = 'Great job, kiddo!';
	return title;
}

Template.orps.status_loading = function () {
	var round = current_round();
	return round && round.status && round.status === 'loading';
}
Template.orps.status_writing = function () {
	var round = current_round();
	return round && round.status && round.status === 'writing';
}
Template.orps.status_answering = function () {
	var round = current_round();
	return round && round.status && round.status === 'answering';
}
Template.orps.status_results = function () {
	var round = current_round();
	return round && round.status && round.status === 'results';
}

//
// Loading template
//

Template.loading.random_planet_name = function () {
	prefixes = [
		'Flur',
		'Opnon',
		'Shontoo',
		'Vardon',
		'Relko'
	];
	suffixes = [
		'bogglid',
		'dle',
		'blork',
		'panard',
		'vry'
	];

	return prefixes[Math.floor(Math.random()*prefixes.length)] + suffixes[Math.floor(Math.random()*suffixes.length)];
}

//
// Writing template
//

Template.writing.players = function () {
	var round = current_round();
	var players = Players.find( { _id: { $in: round.round_players } } );
	return players;
}

Template.writing.btn_primary_or_success = function () {
	var me = player();
	return (me && me.status === 'done') ? 'btn-success' : 'btn-primary';
}

Template.writing.events({
	'click .mark-correct': function (event, template) {
		$('.mark-correct').removeClass('on').addClass('off');
		$(event.srcElement).addClass('on');
	},
	'click .ready-question': function (event, template) {
		Meteor.call('get_my_status', function (error, result) {
			if (result === 'waiting')	{
				Meteor.call('set_my_status', 'done');
			} else {
				Meteor.call('set_my_status', 'waiting');
			}
		});
	}
});

Template.writing_player.eva_status = function () {
	var player = get_player(this._id);
	return (player && player.status === 'done') ? 'eva-done' : 'eva-waiting';
}

Template.writing_player.display_name = function () {
	var player = get_player(this._id);
	return displayName(player);
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
Template.debug.events({
	'click .debug-round-delete': function (event, template) {
		Meteor.call('debug_delete_round', this._id);
	},
	'click .debug-status-loading': function (event, template) {
		Meteor.call('debug_jump_to_state', 'loading', this._id);
	},
	'click .debug-status-writing': function (event, template) {
		Meteor.call('debug_jump_to_state', 'writing', this._id);
	},
	'click .debug-status-answering': function (event, template) {
		Meteor.call('debug_jump_to_state', 'answering', this._id);
	},
	'click .debug-status-results': function (event, template) {
		Meteor.call('debug_jump_to_state', 'results', this._id);
	},
});
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
