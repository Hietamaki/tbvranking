const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/index/generate");
const { ListEventsBySeries } = require("./visualize/util");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

db.find({}, function(err, events) {

	const events_by_series = ListEventsBySeries(events)

	console.log("Visualizing index.")

	fs.writeFile(
		"./html/index.html",
		GenerateHTML(events_by_series),
		err => err? console.log(err) : null);
});
