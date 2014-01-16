Games = new Meteor.Collection('games');
// {name: 'ART 175', description: 'Study Room for ART 175', players: {player_id: 123, name}}

Players = new Meteor.Collection('players');
// {name: 'Bob Dole', game_id: 123}


//
// Users
//

var displayName = function (user) {
	if (user.profile && user.profile.name) {
		return user.profile.name;
	}
	return user.emails[0].address;
};

var contactEmail = function (user) {
	if (user.emails && user.emails.length) {
		return user.emails[0].address;
	}
	if (user.services && user.services.facebook && user.services.facebook.email) {
		return user.services.facebook.email;
	}
	return null;
};
