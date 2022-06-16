const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/ranking/generate");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

pdb.find({}, function(err, players) {

	let current_year = new Date().getFullYear()

	// baseless assumption here that future series are named in the same style,
	// also in index/generate.js and transform_data.js 
	for (ranking of [current_year+"-M", current_year+"-W"]) {
		console.log("Visualizing ranking.")

		fs.writeFile("html/"+ranking+".html", GenerateHTML(players, ranking), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

