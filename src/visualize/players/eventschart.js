const nunjucks = require("nunjucks");

exports.DrawEventsChart = function (player_events) {
	
	let season_data = {};
	var i=0

	for (let eventname of Object.keys(player_events)) {
		
		let event = player_events[eventname];

		if (!season_data[event.season])
			season_data[event.season] = [];
		
		season_data[event.season].push({
			x: i++,
			y: event.event_score,
			event_name: eventname,
			event: event
		});
	}

	var colors = ["red", "blue", "orange", "green", "purple", "yellow"]
	let datasets = [],
		k = 0;
	const entries = Object.entries(season_data);
	const startVisibleFrom = entries.length - 5;

	for (season of entries) {
		let color = colors[k++ % colors.length];
		datasets.push({
			label: season[0],
			backgroundColor: color,
			borderColor: color,
			data: season[1],
			fill: false,
			showLine: true,
			hidden: k <= startVisibleFrom
		})
	}

	const html = nunjucks.render("players/eventschart.njk", {datasets});

	return html;
}

