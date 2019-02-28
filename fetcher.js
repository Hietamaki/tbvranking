const request = require('request-promise-native');
const fs = require("fs");
const mkdirp = require("mkdirp");

const base_url = "http://turkubeachvolley.fi/node/"
const events = process.argv.slice(2);

if (!Number(events[0])) {
	console.log("Enter event id as parameter to fetch.")
	process.exit()
}

for (event of events) {

	mkdirp("cache/events/"+event);
	const event_id = Number(event);

	console.log("Fetching event: "+base_url+event_id)

	const site_root = request(base_url + event_id)
	const site_groups = request(base_url + event_id + "/groups")
	const site_results = request(base_url + event_id + "/results")

	Promise.all([site_root, site_groups, site_results]).then(function(body) {
			
			const stream_root = fs.createWriteStream("cache/events/"+event_id+"/index");
			const stream_groups = fs.createWriteStream("cache/events/"+event_id+"/groups");
			const stream_results = fs.createWriteStream("cache/events/"+event_id+"/results");
			
			stream_root.once("open", function(fd) {
				stream_root.end(body[0]);
			})

			stream_groups.once("open", function(fd) {
				stream_groups.end(body[1]);
			})
			
			stream_results.once("open", function(fd) {
				stream_results.end(body[2]);
			})

		})
		.catch(function(error) {
			console.log("Error: "+error);
			process.exit();
		});
}