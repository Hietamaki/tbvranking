const fs = require("fs");
const nedb = require("nedb");

const edb = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

LoadFromDB();

function LoadFromDB() {
	edb.find({}, function(err, events) {

		//const events_by_series = ListEventsBySeries(events)

		for (event of events) {
			console.log("Transforming event: "+event.id);
			for (group of event.groups) {
				group.winners = GetWinners(group);
				group.scores = group.scores.map(score => Math.abs(score));
				group.players = group.players.map(p => CalculatePlayerScores(p, event.date));
			}
			saveEvent(event);
		}
	});
}

function saveEvent(record) {
	edb.update(
		{id: record.id},
		record,
		{upsert: true},
		error => { error && console.log(error)}
	);
}

function savePlayer(record) {
	pdb.update(
		{ name: record.name },
		{ record },
		{ upsert: true },
		error => {error && console.log(error)}
	);
}

function CalculatePlayerScores(player, date) {

	const difference = (player.rank_new - player.rank_old).toFixed(2);
	const add_sign = player.rank_change > 0 ?  "+" : "";
	player.rank_change = add_sign + difference;

	player.ball_score = (player.score * getBallScore(date)).toFixed(2);
	player.placement_score = (player.event_score - player.ball_score);
	player.last_week_score = (player.rank_new - player.event_score).toFixed(2);
	player.last_last_week_score = (player.rank_old - player.last_week_score).toFixed(2);

	return player;
}

function getBallScore(date) {
	if (date.split(".")[2] >= 2020)
		return 0.05;
	else
		return 0.045;
}


function GetWinners(group) {

	const winners = [];
	for (round = 1; round <= 3; round++) {
		//scoreboard is anchored to first in group's perspective
		const anchor_score = group.scores[round - 1];
		const winners_positions = CalculateWinnersPositions(anchor_score, round);
		winners.push(GetNamesFromPositions(group.players, winners_positions));
	}
	return winners;
}

// For this round and anchor score, what are the starting positions of winners?
function CalculateWinnersPositions(anchor_score, round) {

	// Player at position 1 plays first with 4th, 3rd and last with 2nd position
	const partner_position = 5 - round;
	
	return anchor_score > 0
		? [1, partner_position]
		: [2, 3, 4].filter(position => position !== partner_position);
}

function GetNamesFromPositions(players, start_positions) {
	return players
		.filter(p => start_positions.includes(p.start_position))
		.sort((p1, p2) => (p2.score) - (p1.score))
		.map(p => p.name);
}

function ListEventsBySeries(events) {

	const events_by_series = {};

	for (event of events) {
		for (tag of event.tags) {
			if (!tag.match(/^\d{4}-\w$/))
				continue;
			if (!events_by_series[tag])
				events_by_series[tag] = [];
			
			events_by_series[tag].push([event.id, event.date]);
		}
	}
	return events_by_series;
}
