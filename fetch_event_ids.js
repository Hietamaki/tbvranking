const request = require('request-promise-native');
const fs = require("fs");
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const base_url = "http://turkubeachvolley.fi/"
const events = process.argv.slice(2);

console.log("Fetching events from "+base_url)

request(base_url).then(function(fetched) {
	
	const doc = (new JSDOM(fetched)).window.document;

	let event_links = doc.querySelectorAll(".views-field-title > a")
	var events = "";

	for (link of event_links) {
		if (link.innerHTML.toLowerCase().indexOf("viikkokisa") !== -1)
			events += link.href.substr(6) + " "
	}

	fs.writeFile("./new_events.dat", events.trim(), (err) => {
	    if (err)
	    	console.log(err);
	});

})
.catch(function(error) {
	console.log("Error: "+error);
	process.exit();
});
