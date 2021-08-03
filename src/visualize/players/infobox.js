const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;


exports.DrawInfoBox = function (events) {
    let infobox = document.createElement("div")
	infobox.classList.add("infobox")
	infobox.innerHTML = DrawBestWeek(events);
	infobox.innerHTML += "<br />";
	infobox.innerHTML += DrawAverageGroup(events);

    return infobox;
}

function DrawAverageGroup(events) {
	
	let groups = {}

	for (let eventname of Object.keys(events)) {
		let event = events[eventname]
		if (!groups[event.season])
			groups[event.season] = []
		groups[event.season].push(event.group)
	}

	let means = {}

	for (let group of Object.keys(groups)) {
		let season_mean = groups[group].reduce((prev, cur) => cur += prev) / groups[group].length;
		means[group] = season_mean.toFixed(2);
	}

	return `<div class="infoline">Keskimääräinen lohko: <ul><li>${JSON.stringify(means)
		.replace(/"/g,"")
		.replace(/:/g,": ")
		.replace(/,/g, "</li><li>")
		.slice(1,-1)}</li></ul></div>`
}

function DrawBestWeek(events) {
	
	let best_week_id
	let best_week_score
	let best_week_date
	let best_week_points = -100

	for (let eventname of Object.keys(events)) {
		let event = events[eventname];

		//console.log(best_week_points +" vs "+event.points)
		if (best_week_points < event.points || (event.points == best_week_points && best_week_score < event.event_score)) {
			best_week_id = eventname
			best_week_points = parseInt(event.points)
			best_week_date = event.date
			best_week_score = event.event_score
		}
	}

	return `<div class="bestweek_container">Eniten pisteitä viikolla: <a href='../${best_week_id}.html' class='bestweek'> ${best_week_date}, ${best_week_points} pistettä </a></div>`
}