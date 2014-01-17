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
	join: function (game_id) {
		Players.insert({
			name: displayName(Meteor.user()),
			user_id: Meteor.userId(),
			game_id: game_id,
			round_id: '',
		});
	},
	leave: function (game_id) {
		// Mark this player as "not_ready" in case they were waiting for a game
		var player = Players.findOne({user_id: Meteor.userId()});
		// Update current player's status
		Players.update( player._id, { $set: { round_id: null } } );
		// Get the round the current player is in
		var round_id = Rounds.findOne({status: 'waiting', round_players: { $in: [player._id] } } );
		// Remove current player from the round they are in
		Rounds.update( round_id, { $pull: {round_players: player._id } } );
		// Remove all rounds that have no players (cleanup)
		Rounds.remove({ round_players: { $size: 0 } } );

		// Remove this player from the game room
		Players.remove({ user_id: Meteor.userId() });
	},
	ready: function (game_id) {
		var player = Players.findOne({user_id: Meteor.userId()});

		// If there's already players waiting
		var round = Rounds.findOne({status: 'waiting'});

		// if there isn't a game in the waiting state, create a new one
		if (!round) {
			round_id = Rounds.insert({
				timestamp: new Date().getTime(),
				status: 'waiting',
				round_players: [],
			});
			var round = Rounds.findOne({_id: round_id});
		}

		// Update current player's status
		Players.update( player._id, { $set: { round_id: round._id } } );

		// Add current player to (new) round
		Rounds.update( round._id, { $addToSet: { round_players: player._id } } );

		// Move onto game if we have enough players
		round = Rounds.findOne({_id: round._id});
		if (round && round.round_players.length > 1) {
			Rounds.update( round._id, { $set: { status: 'loading' } } );
		}
	},
	not_ready: function () {
		var player = Players.findOne({user_id: Meteor.userId()});

		// Update current player's status
		Players.update( player._id, { $set: { round_id: null } } );

		// Get the round the current player is in
		var round_id = Rounds.findOne({status: 'waiting', round_players: { $in: [player._id] } } );

		// Remove current player from the round they are in
		Rounds.update( round_id, { $pull: {round_players: player._id } } );

		// Remove all rounds that have no players (cleanup)
		Rounds.remove({ round_players: { $size: 0 } } );
	},

	////////////////////////////
	// DEBUG CODE
	debug_delete_round: function (round_id) {
		Rounds.remove({_id: round_id});
	},
	debug_jump_to_state: function (state, round_id) {
		Rounds.update( round_id, { $set: { status: state } } );
	}
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

