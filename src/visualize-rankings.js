const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/ranking/generate");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

pdb.find({}, function(err, players_db) {

	let current_year = new Date().getFullYear()

	// baseless assumption here that future series are named in the same style,
	// also in index/generate.js and transform_data.js 
	let series_names = [current_year+"-M", current_year+"-W"];

	series_names = players_db.flatMap(p => Object.values(p.events).map(e => e.season))
		.filter((v, i, s) => s.indexOf(v) === i)

	for (series_name of series_names) {
		console.log("Visualizing ranking "+series_name)

		let series_players = JSON.parse(JSON.stringify(players_db));;
		// filteröi jo nyt pdb:stä ylimääräiset eventit pois niin Generate yksinkertaistuu
		series_players.forEach(p => {

			// add total event amount (should be in transform)
			p.total_events = Object.keys(p.events).length;
			p.series_events = Object.fromEntries(
				Object.entries(p.events).filter(([key, value]) => value.season === series_name)) 
			})
		series_players = series_players.filter(p => Object.keys(p.series_events).length > 0)

		fs.writeFile("html/"+series_name+".html", GenerateHTML(series_players, series_name), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

