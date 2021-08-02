const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

var latest_event;

exports.DrawRanking = function (players, season) {
	let content = document.createElement("div")
	content.classList.add("rankingcontainer");
	content.innerHTML +=   "<h2>Ranking "+season+"</h2>"
	content.innerHTML += Biggest(players, season)

	return content;
}

function GetLatestEvent(players, season) {
	return players
		.filter(x => x.season == season)
		.map(x => Object.keys(x.events))
		.map(x => parseInt(x.reverse()[0]))
		.reduce((prev, cur) => cur > prev ? cur : prev, 0)
}

function GetChangeFromLastWeek(player) {

	let events = Object.values(player.events).reverse()

	if (events.length < 2)
		return 0;
	
	let players_latest_event = parseInt(Object.keys(player.events).reverse());
	let change = latest_event == players_latest_event && events.length > 1 ? events[0].rank_score - events[1].rank_score : 0

	return change;
}

function Biggest(players, season) {

	latest_event = GetLatestEvent(players, season)

	players = players
		.filter(x => x.season == season)
		.sort((a,b) => b.rank_score - a.rank_score)
		.map(x => {x.recent_change = GetChangeFromLastWeek(x); return x})
		.map(x => {x.score_lastweek = x.rank_score - x.recent_change; return x})
		.sort((a,b) => b.score_lastweek - a.score_lastweek)
		.map((x, i) => {x.rank_lastweek = i; return x;})
		.sort((a,b) => b.rank_score - a.rank_score)


    var toplist = "<table>";
	toplist += "<tr><th>Sija</th><th>Kisaaja</th><th>Muutos</th><th>Kerrat</th><th>Pisteet</th></tr>";

    for (let i = 0; i < players.length; i++) {
		let name = players[i].name
		let rank_score = players[i].rank_score
		let rank_lastweek = StylizeRankChange(players[i].rank_lastweek - i);
		let events = Object.values(players[i].events).reverse()
		let osallistumisia = events.filter(x => x.season == season).length

        toplist += `<tr class="riser"><td>${i+1}.</td><td><a href="p/${name}.html">${name}</a></td><td>${rank_lastweek}</td><td>${osallistumisia}</td><td>${rank_score}</td>`;

    }

	toplist += "</table>"

	return `<div class="rankinglist">${toplist}</div>`;

}

function StylizeRankChange(change) {
	
	let style;

	if (change > 0) {
		change = "+" + change;
		style = "positive";
	}
	else if (change < 0)
		style = "negative";
	else
		style = "neutral";
	
	return `<span class="${style}">${change}</span>`
}