const { JSDOM } = require('jsdom');
const { GetHeaders } = require("../headers");
const { DrawEventSelector } = require("../eventselector");
const { DrawRecentEvents } = require("./recentevents");
const { DrawBiggestRisers } = require("./biggestrisers");

//
/// Sisältää:
//  - Linkit miesten ja naisten tuoreimpiin suorituksiin. Moniko lohko raportoinut jos kesken.
//  - Isoimmat nousijat (ranking) top 5
//  - Isoimmat eräpisteet top 5
//  - Uudet pelaajat(?)
//  - Kauden valinta

var document;

exports.GenerateHTML = function (events, events_by_series) {

	var new_dom = (new JSDOM(GetHeaders()));
	document = new_dom.window.document;

	let content = DrawContentDiv(events_by_series)
	content.appendChild(DrawEventSelector(events_by_series))
	content.appendChild(DrawTitle())
	content.appendChild(DrawRankings())
	content.appendChild(DrawRecentEvents(events))
	content.appendChild(DrawBiggestRisers(events))
	content.appendChild(DrawFooter())

	document.body.appendChild(content)

	return new_dom.serialize();
}

function DrawFooter() {
	let bottom = document.createElement("div");
	bottom.classList.add("footer");
	bottom.innerHTML = `Tieto haettu <a href='https://turkubeachvolley.fi/' target="_blank">turkubeachvolley.fi</a>-sivustolta ${(new Date()).toLocaleString()}.`;

	return bottom;
}

function DrawRankings() {
	let content = document.createElement("div")
	content.classList.add("rankingbuttons")
	content.innerHTML = "<div class='rankingbutton'><a class='rankingbutton' href='2021-M.html'>Ranking 2021 Miehet</a><br></div>"
	content.innerHTML += "<div class='rankingbutton'><a class='rankingbutton' href='2021-N.html'>Ranking 2021 Naiset</a></div>"

	return content;
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"

	return content;
}

function DrawTitle() {
	let title = document.createElement("h1")
	title.innerHTML = "Turku Beach Volley tulospalvelu"

	return title;
}