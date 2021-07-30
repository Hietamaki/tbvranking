const fs = require("fs");
const nedb = require("nedb");
const { GenerateHTML } = require("./visualize/players/generate");

const db = new nedb({filename: "db/events.db", autoload: true});
const pdb = new nedb({filename: "db/players.db", autoload: true});

// tällä pästään käsiksi documentin metodeihin missä instanssilla ei oikeasti ole väliä
var document;

pdb.find({}, function(err, players) {

	for (player of players) {
		console.log("Visualizing player: "+player.name)

		fs.writeFile("html/p/"+player.name+".html", GenerateHTML(player), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

