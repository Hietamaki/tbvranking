const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawRecentEvents = function (events) {
	let content = document.createElement("div")
	content.innerHTML += "<h2>Tuoreimmat tapahtumat</h2>"
	content.classList.add("rankinglist")

    events = events.sort((a, b) => b.id - a.id)
    
	content.innerHTML += LinkToEvent(events[0])

	// Add only second if women had their games
	if (events[0].date == events[1].date)
		content.innerHTML += LinkToEvent(events[1])

	return content;
}

function LinkToEvent(event) {
	let groups_reported = event.groups
		.filter(x => x.scores.every(x => x != 0))
		.length
	let groups_amount = event.groups.length;

	let eventlink = `<a href="${event.id}.html">Sarjan ${event.series} tapahtuma ${event.date}</a>`;
	let reported = groups_reported < groups_amount ? ` (${groups_reported}/${groups_amount} lohkoa raportoinut)` : ` (${groups_amount} lohkoa)`;
	
	return `<div class="recentevent">${eventlink}${reported}</div>`;

}