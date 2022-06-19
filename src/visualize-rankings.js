const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/ranking/generate");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

pdb.find({}, function(err, players_db) {

	let current_year = new Date().getFullYear()

	// baseless assumption here that future series are named in the same style,
	// also in index/generate.js and transform_data.js 
	for (series_name of [current_year+"-M", current_year+"-W"]) {
		console.log("Visualizing ranking "+series_name)

		fs.writeFile("html/"+series_name+".html", GenerateHTML(players_db, series_name), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

