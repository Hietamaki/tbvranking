const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/ranking/generate");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

pdb.find({}, function(err, players) {

	for (ranking of ["2021-M", "2021-N"]) {
		console.log("Visualizing ranking.")

		fs.writeFile("html/"+ranking+".html", GenerateHTML(players, ranking), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

