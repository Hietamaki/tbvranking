const { JSDOM } = require('jsdom');
const { GetHeaders } = require("../headers");
const { DrawEventSelector } = require("../eventselector");

//
/// Sisältää:
//  - Linkit miesten ja naisten tuoreimpiin suorituksiin. Moniko lohko raportoinut jos kesken.
//  - Isoimmat nousijat (ranking) top 5
//  - Isoimmat eräpisteet top 5
//  - Uudet pelaajat(?)
//  - Kauden valinta

var document;

exports.GenerateHTML = function (events_by_series) {

	var new_dom = (new JSDOM(GetHeaders()));
	document = new_dom.window.document;

	let content = DrawContentDiv(events_by_series)
	content.appendChild(DrawEventSelector(events_by_series))
	content.appendChild(DrawTitle())

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