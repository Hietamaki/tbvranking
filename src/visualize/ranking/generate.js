const { JSDOM } = require('jsdom');
const { GetHeaders } = require("../headers");
const { DrawEventSelector } = require("../eventselector");
const { DrawRanking } = require("./ranking");

var document;

exports.GenerateHTML = function (players_db, series_name) {

	var new_dom = (new JSDOM(GetHeaders()));
	document = new_dom.window.document;

	let content = DrawContentDiv()
	//content.appendChild(DrawEventSelector(events_by_series))
	content.appendChild(DrawTitle())
	content.appendChild(DrawRanking(players_db, series_name))

	document.body.appendChild(content)

	return new_dom.serialize();
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