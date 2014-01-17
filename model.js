Games = new Meteor.Collection('games');
// {name: 'ART 175', description: 'Study Room for ART 175'}

Players = new Meteor.Collection('players');
// {name: 'Bob Dole', user_id: Asdf123, game_id: Asdf123, round_id: Asdf123}

Chats = new Meteor.Collection('chats');
// {name: 'Bob Dole', game_id: Asdf123, message: 'hi', timestamp: 123456}

Rounds = new Meteor.Collection('rounds');
// {timestamp: 123456, status: '[waiting|loading|writing|answering|results]', players: [ Asdf123, Asdf123 ] } }

Questions = new Meteor.Collection('questions');
// {player_id: Asdf123, round_id: Asdf123, question: 'What is X?', answer_a: 'A', answer_b: 'B', answer_c: 'C', answer_correct: '[a|b|c]'}

Answers = new Meteor.Collection('answers');
// {player_id: Asdf123, question_id: Asdf123, answer: '[a|b|c]', is_correct: [true|false] }