const jsdom = require('jsdom');
const fs = require("fs");
const nedb = require("nedb");

const edb = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});
const { JSDOM } = jsdom;

var directory = "cache/events/";
var players = {}

fs.readdir("cache/events/", (err, files) => {
	files.forEach(file => {
		
		const event_id = Number(file);

		var record = CreateEventFromIndexDOM(event_id);
		var starting_rankings = GetPlayerInfoFromGroupsDOM(event_id);

		for (let dom_group of GetGroupsFromResultsDOM(event_id))
			record.groups.push(CreateGroupFromDOM(dom_group, starting_rankings, record));
		
		if (record.groups.some(group => group.scores.some(game => game !== ""))) {
			console.log("Adding event to database: "+file)

			edb.update({id: event_id}, record, {upsert: true}, (error, replaced) => {
				if (error)
					console.log(error);
			});
		}
	});

	for (player of Object.keys(players)) {
		pdb.update(
			{name: player},
			{name: player,
			events: players[player]},
			{upsert: true},
			(error, replaced) => {
			if (error)
				console.log(error);
		});
	}
});

function CreateGroupFromDOM(dom_group, starting_rankings, event) {

	let group = {
		players: [],
		scores: []
	}

	for (let dom_player of dom_group) {
		
		var player = CreatePlayerObject(dom_player, starting_rankings);
		group.players.push(player);

		// Saving round scores from first player perspective 1-4, 1-3, 1-2
		if (player.start_position == 1) {
			
			group.scores = GetScoresFromPlayerDOM(dom_player);
		}

		//what = player.name.replace(/[^\w\s]/gi, '')
		//if (what.indexOf(".") !== -1)
		//	console.log(what)
		var season;
		for (tag of event.tags)
			if (tag.match(/^\d{4}-\w$/))
				season = tag;

		if (!players[player.name])
			players[player.name] = {}
		players[player.name][event.id] = {
			group: parseInt(player.group),
			points: Number(player.score).toFixed(0),
			event_score: player.event_score,
			rank_score: player.rank_new,
			date: event.date,
			season
		}
	}

	return group;
}

function CreatePlayerObject( dom_player, starting_rankings ) {

	const name = dom_player.querySelector(".username").innerHTML

	return {
		name: name,
		group: dom_player.querySelector(".views-field-gid").innerHTML.trim(),
		score: dom_player.querySelector(".views-field-deltapoints").innerHTML.trim(),
		event_score: dom_player.querySelector(".views-field-score").innerHTML.trim(),
		rank_new: Number(dom_player.querySelector(".views-field-ranking").innerHTML),
		rank_old: starting_rankings[name].old_rank,
		start_position: starting_rankings[name].start_position
	}
}

function GetScoresFromPlayerDOM(dom_player) {
	return [
		dom_player.querySelector(".views-field-game1").innerHTML.trim(),
		dom_player.querySelector(".views-field-game2").innerHTML.trim(),
		dom_player.querySelector(".views-field-game3").innerHTML.trim()
	];
}

function CreateEventFromIndexDOM(event_id) {
	
	var index_file = fs.readFileSync(directory + event_id +"/index")
	const doc_index = (new JSDOM(index_file)).window.document;
	const dateHtml = doc_index.querySelector(".date-display-single").innerHTML;

	var record = {
		id: event_id,
		groups: [],
		date: dateHtml.substring(0, dateHtml.indexOf("-")),
		tags: []
	};

	record.date = (new Date(Date.parse(record.date))).toLocaleDateString('fi-FI')

	for (let tag of (doc_index.querySelectorAll(".field-type-taxonomy-term-reference > div > div > a"))) {
		record.tags.push(tag.innerHTML)
	}

	return record;
}

function GetGroupsFromResultsDOM(event_id) {

	var results_file = fs.readFileSync(directory + event_id +"/results")
	const doc_results = (new JSDOM(results_file)).window.document;

	let result_table = doc_results.querySelector(".views-table")
	let dom_groups = []

	for (let dom_group of result_table.querySelectorAll("tr")) {

		let group_number = Number(dom_group.querySelector(".views-field-gid").innerHTML)
		
		if (isNaN(group_number))
			continue;

		group_number -= 1

		if (!dom_groups[group_number])
			dom_groups[group_number] = []

		dom_groups[group_number].push(dom_group);
	}

	return dom_groups;
}


function GetPlayerInfoFromGroupsDOM(event_id) {

	var group_file = fs.readFileSync(directory + event_id +"/groups")
	const doc_groups = (new JSDOM(group_file)).window.document;

	let old_rankings = []
	
	let table = doc_groups.querySelector(".view-content")
	let start_position = 1

	for (let each of table.querySelectorAll("tr")) {

		let player_name = each.querySelector(".username");
		
		if (player_name) {
			old_rankings[player_name.innerHTML] = {
				old_rank: Number(each.querySelector(".views-field-ranking").innerHTML.trim()),
				start_position: start_position
			}

			start_position++

			if (start_position > 4)
				start_position = 1;
		}
	}

	return old_rankings
}
