const fs = require("fs");
const nedb = require("nedb");

const { GetPlayers } = require("./transform/players");
const { GetWinners } = require("./transform/winners");
const { GetRankings } = require("./transform/rankings");

const edb = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

LoadFromDB();

function LoadFromDB() {
	edb.find({}, function(err, events) {

		//const events_by_series = ListEventsBySeries(events)
		//let rankings = GetRankings(events);

		for (event of events) {
			console.log("Transforming event: "+event.id);
			event.series = GetSeries(event);

			for (group of event.groups) {
				group.winners = GetWinners(group);
				group.scores = GetScores(group.scores);
				group.players = GetPlayers(group.players, event.date);
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

function GetScores(scores) {
	return scores.map(score => Math.abs(score));
}

function GetSeries(event) {

	for (tag of event.tags) {
		if (tag.match(/^\d{4}-\w$/))
			return tag;
	}
}

function ListEventsBySeries(events) {

	const events_by_series = {};

	for (event of events) {
		if (!events_by_series[event.series])
			events_by_series[event.series] = [];
		
		events_by_series[event.series].push([event.id, event.date]);
	}
	return events_by_series;
}
