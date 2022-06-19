const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;
const NEW_PLAYER = 9999;

exports.DrawRanking = function (players_db, series_name) {
	let content = document.createElement("div")
	content.classList.add("rankingcontainer");
	content.innerHTML +=   "<h2>Ranking "+series_name+"</h2>"
	content.innerHTML += DrawRankingTable(players_db, series_name)

	return content;
}

function DrawRankingTable(players_db, series_name) {

	players_db = SortPlayersByRankAndMapRankInfo(players_db, series_name)

    var toplist = "<table>";
	toplist += "<tr><th>Sija</th><th>Kisaaja</th><th>Muutos</th><th>Kerrat</th><th>Pisteet</th></tr>";

    for (let i = 0; i < players_db.length; i++) {
		let name = players_db[i].name
		let rank_score = players_db[i].rank_score
		let rank_lastweek = StylizeRankChange(players_db[i].rank_lastweek - i, players_db[i].recent_change == NEW_PLAYER);
		let events = Object.values(players_db[i].events).reverse()
		let osallistumisia = events.filter(x => x.season == series_name).length

        toplist += `
			<tr class="riser">
				<td>${i+1}.</td>
				<td><a href="p/${name}.html">${name}</a></td>
				<td>${rank_lastweek}</td>
				<td>${osallistumisia}</td>
				<td>${rank_score}</td>
			</tr>`;
    }

	toplist += "</table>"

	return `<div class="rankinglist">${toplist}</div>`;
}

function SortPlayersByRankAndMapRankInfo(players_db, series_name) {

	latest_event = GetSeriesLatestEvent(players_db, series_name)

	return players_db
		.filter(x => x.season == series_name)
		.sort((a,b) => b.rank_score - a.rank_score)
		.map(x => {x.recent_change = GetChangeFromLastWeek(x, latest_event); return x})
		.map(x => {x.score_lastweek = x.rank_score - x.recent_change; return x})
		.sort((a,b) => b.score_lastweek - a.score_lastweek)
		.map((x, i) => {x.rank_lastweek = i; return x;})
		.sort((a,b) => b.rank_score - a.rank_score);
}

function GetSeriesLatestEvent(players_db, series_name) {
	return players_db
		.filter(x => x.season == series_name)
		.map(x => Object.keys(x.events))
		.map(x => parseInt(x.reverse()[0]))
		.reduce((prev, cur) => cur > prev ? cur : prev, 0)
}

function GetChangeFromLastWeek(player, latest_event) {

	let events = Object.values(player.events).reverse()

	if (events.length < 1)
		return 0;
	
	let players_latest_event = parseInt(Object.keys(player.events).reverse());
	
	if (events.length == 1 && players_latest_event == latest_event)
		return NEW_PLAYER;
	
	let change = latest_event == players_latest_event && events.length > 1
		? events[0].rank_score - events[1].rank_score
		: 0

	return change;
}

function StylizeRankChange(change, new_player) {
	
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
	
	return `<span class="${style}">${change}</span>`
}