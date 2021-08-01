const { JSDOM } = require('jsdom');
const { GetHeaders } = require("./headers");
const { DrawRoundsBox } = require("./roundsbox");
const { DrawScoreTable } = require("./scoretable");
const { DrawEventSelector } = require("./eventselector");

var document;

exports.GenerateHTML = function (events_by_series, event) {

	var new_dom = (new JSDOM(GetHeaders(event.date)));
	document = new_dom.window.document;
	
	let content = DrawContentDiv(events_by_series)
	content.appendChild(DrawEventSelector(events_by_series))
	content.appendChild(DrawTitle(event))
	content.appendChild(DrawScores(event))


	document.body.appendChild(content)

	return new_dom.serialize();
}

function DrawScores(event) {

	let groups_container = document.createElement("div")

	let lohko = 1

	for (let group of event.groups) {
		if (!group)
			continue;

		let group_elem = document.createElement("div")
		group_elem.innerHTML = "<h2>Lohkon "+(lohko++)+" tulokset</h2>"

		group_elem.appendChild(DrawScoreTable(group))
		group_elem.appendChild(DrawRoundsBox(group))
		groups_container.appendChild(group_elem)
	}

	return groups_container;
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"

	return content;
}

function DrawTitle(event) {
	let title = document.createElement("h1")
	title.innerHTML = event.tags[0].slice(0, 7).trim() + ": "+event.date

	return title;
}