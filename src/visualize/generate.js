const { JSDOM } = require('jsdom');
const { GetHeaders } = require("./headers");
const { DrawRoundsBox } = require("./roundsbox");
const { DrawScoreTable } = require("./scoretable");

var document;

exports.GenerateHTML = function (events_by_series, event) {

	var new_dom = (new JSDOM(GetHeaders(event.date)));
	document = new_dom.window.document;

	let content_elem = DrawContentDiv(events_by_series)
	document.body.appendChild(content_elem)

	let lohko = 1

	for (let group of event.groups) {
		if (!group)
			continue;

		let group_elem = document.createElement("div")
		group_elem.innerHTML = "<h2>Lohkon "+(lohko++)+" tulokset</h2>"

		group_elem.appendChild(DrawScoreTable(group))
		group_elem.appendChild(DrawRoundsBox(group))
		content_elem.appendChild(group_elem)
	}

	return new_dom.serialize();
}

function DrawContentDiv(events_by_series) {
	let content = document.createElement("div")
	content.id = "content"
	
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"
	content.appendChild(upperbox)

	upperbox.innerHTML = "<span class='guide'>VALITSE KISATAPAHTUMA:</span><br>";

	for (page of Object.keys(events_by_series).sort().reverse())
		upperbox.appendChild(DrawSerieDropdown(events_by_series, page))

	let title = document.createElement("h1")
	
	title.innerHTML = event.tags[0].slice(0, 7).trim() + ": "+event.date
	content.appendChild(title)

	return content;
}

function DrawSerieDropdown(events_by_series, type) {

	let menubox = document.createElement("div")
	let menubutton = document.createElement("button")
	let menu = document.createElement("div")

	menubox.classList.add("dropdown")
	menubutton.setAttribute("onclick", "openMenu('"+type+"')")
	menubutton.classList.add("dropbtn")

	if (event.tags.includes(type))
		menubutton.classList.add("dropbtnactive");

	menubutton.innerHTML = type
	menu.id = "dropdown-"+type
	menu.classList.add("dropdown-content")

	menubox.appendChild(menubutton);
	menubox.appendChild(menu)

	for (page of events_by_series[type].sort((x, y) => y[0] - x[0])) {
		let link = document.createElement("a");
		link.href = page[0]+".html"

		if (event.id == page[0])
			link.id = "active"
		link.innerHTML = page[1]
		menu.appendChild(link)
	}

	return menubox
}
