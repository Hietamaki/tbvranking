const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;
const NEW_PLAYER = -1;

exports.DrawRanking = function (players_db, series_name) {
	let content = document.createElement("div")
	content.classList.add("rankingcontainer");
	content.innerHTML +=   "<h2>Ranking "+series_name+", <a href='"+GetSeriesLatestEvent(players_db)+".html'>viikon pisteet</a></h2>"
	content.innerHTML += DrawRankingTable(players_db, series_name)

	return content;
}

function DrawRankingTable(players_db, series_name) {

	players_db = EnrichPlayersData(players_db, series_name);
	players_db = SortPlayersByRank(players_db);

    var toplist = "<table>";
	toplist += "<tr><th>Sija</th><th>Kisaaja</th><th>Muutos</th><th>Osallistunut</th><th>Pisteet</th></tr>";

    for (let i = 0; i < players_db.length; i++) {
		let player = players_db[i];

		let is_new_player = Object.keys(player.events).filter(e => parseInt(e) <= GetSeriesLatestEvent(players_db)).length == 1
			&& Object.keys(player.events)[0] == GetSeriesLatestEvent(players_db)
		let is_season_first = player.rank_lastweek == NEW_PLAYER;

		let name = player.name
		let rank_score = player.rank_score
		let position_lastweek = StylizeRankChange(
			player.position_lastweek - i,
			is_season_first,
			is_new_player,
			);
		let events = Object.values(player.series_events).reverse()
		let osallistumisia = events.length

        toplist += `
			<tr class="riser">
				<td>${i+1}.</td>
				<td><a href="p/${name}.html">${is_season_first && is_new_player ? name+" 🌱" : name}</a></td>
				<td>${position_lastweek}</td>
				<td>${parseInt(osallistumisia / GetAllEvents(players_db).length * 100)} %</td>
				<td>${rank_score}</td>
			</tr>`;
    }

	toplist += "</table>"

	return `<div class="rankinglist">${toplist}</div>`;
}

function GetAllEvents(players_db) {
	return players_db.flatMap(p => Object.keys(p.series_events))
		.filter((v, i, s) => s.indexOf(v) === i)
}

/*
	Enrich the players_db with:
		player.rank_lastweek
		player.position_lastweek
		player.rank_score
	
	Sorts the array as side effect
*/
function EnrichPlayersData(players_db, series_name) {

	latest_event = GetSeriesLatestEvent(players_db, series_name)

	return players_db
		.map(x => {x.rank_lastweek = GetLastWeekRank(x, latest_event); return x})
		.sort((a,b) => b.rank_lastweek - a.rank_lastweek)
		.map((x, i) => {x.position_lastweek = i; return x;})
		.map(x => {
			const latestEventKey = Object.keys(x.series_events).reverse()[0];
			x.rank_score = x.series_events[latestEventKey].rank_score;
			return x;})
}

function SortPlayersByRank(players_db) {
	return players_db
		.sort((a,b) => a.rank_lastweek - b.rank_lastweek)
		.sort((a,b) => b.rank_score - a.rank_score)
}

function GetSeriesLatestEvent(players_db) {
	return players_db
		.map(x => Object.keys(x.series_events))
		.map(x => parseInt(x.reverse()[0]))
		.reduce((prev, cur) => cur > prev ? cur : prev, 0)
}

function GetLastWeekRank(player, latest_event) {

	let event_ids = Object.keys(player.series_events).reverse();

	let players_latest_event = event_ids[0];

	
	if (players_latest_event != latest_event)
		return player.series_events[event_ids[0]].rank_score;
	
	if (event_ids.length == 1)
		return NEW_PLAYER;

	return event_ids.length > 1
		? player.series_events[event_ids[1]].rank_score
		: 0
}

function StylizeRankChange(change, new_player, brand_new) {
	
	let style;

	if (new_player) {
		change = "Uusi"
		style = "new"
	}
	else if (change > 0) {
		change = "+" + change;
		style = "positive";
	}
	else if (change < 0)
		style = "negative";
	else
		style = "neutral";
	
	if (brand_new) {
		change = "Uusi"
		style = "new"
	}
	
	return `<span class="${style}">${change}</span>`
}