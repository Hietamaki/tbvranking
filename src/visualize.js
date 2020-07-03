const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/generate");

const db = new nedb({
	filename: "db/events.db",
	autoload: true
});

// tällä pästään käsiksi documentin metodeihin missä instanssilla ei oikeasti ole väliä

db.find({}, function(err, events) {

	const events_by_series = ListEventsBySeries(events)

	for (event of events) {
		console.log("Visualizing event: "+event.id)

		fs.writeFile(
			"./html/"+event.id+".html",
			GenerateHTML(events_by_series, event),
			err => err? console.log(err) : null);
	}
});

function ListEventsBySeries(events) {

	const events_by_series = {};

	for (event of events) {
		for (tag of event.tags) {
			if (!tag.match(/^\d{4}-\w$/))
				continue;
			if (!events_by_series[tag])
				events_by_series[tag] = [];
			
			events_by_series[tag].push([event.id, event.date]);
		}
	}
	return events_by_series;
}
