const { GetHeaders } = require("../headers");
const { DrawEventsChart } = require("./eventschart");
const { DrawGroupCounts } = require("./groupcounts");
const { DrawInfoBox } = require("./infobox");
const { JSDOM } = require('jsdom');

exports.GenerateHTML = function (player) {

	var new_dom = (new JSDOM(GetHeaders(player.name, true)));
	document = new_dom.window.document;
	
	let content_elem = DrawContentDiv()
	document.body.appendChild(content_elem)

	content_elem.innerHTML += DrawEventsChart(player.events);

	content_elem.appendChild(DrawInfoBox(player.events))
	content_elem.innerHTML += DrawGroupCounts(player.events);
	return new_dom.serialize();
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"
	
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"
	content.appendChild(upperbox)
	let title = document.createElement("h1")
	
	title.innerHTML = player.name
	content.appendChild(title)

	return content;
}