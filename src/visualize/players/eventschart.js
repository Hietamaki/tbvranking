const nunjucks = require("nunjucks");

exports.DrawEventsChart = function (player_events) {
	
	let season_data = {};
	var i=0
	let dates = []
	let events = []
	let points = []
	let groups = []

	for (let eventname of Object.keys(player_events)) {
		
		let event = player_events[eventname];

		if (!season_data[event.season])
			season_data[event.season] = ""

		season_data[event.season] += "{x: "+(i++)+", y:"+event.event_score+"},"
		dates.push(event.date)
		events.push(eventname)
		points.push(event.points)
		groups.push(event.group)
	}

	var colors = ["red", "blue", "orange", "green", "purple", "yellow"]
	let label = "",
		dataset = "",
		k = 0;

	for (season of Object.entries(season_data)) {
		let color = colors[k++ % colors.length];
		dataset += `{
			label: '${season[0]}',
			backgroundColor: '${color}',
			borderColor: '${color}',
			data: [${season[1]}],
			fill: false,
			showLine: true,
		},`

		label += season[1]
	}

	const html = nunjucks.render("players/eventschart.njk", {
		dataset,
		events,
		groups,
		points,
		dates
	  });

	return html;
}

