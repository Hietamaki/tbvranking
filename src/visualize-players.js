const fs = require("fs");
const { JSDOM } = require('jsdom');
const nedb = require("nedb");
const { GetHeaders } = require("./visualize/headers");

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


function GenerateHTML(player) {

	var new_dom = (new JSDOM(GetHeaders(player.name, true)));
	document = new_dom.window.document;
	
	let content_elem = DrawContentDiv()
	document.body.appendChild(content_elem)

	content_elem.innerHTML += DrawEventsChart(player.events);

	let infobox = document.createElement("div")
	infobox.classList.add("infobox")
	infobox.innerHTML = DrawBestWeek(player.events);
	infobox.innerHTML += DrawAverageGroup(player.events);
	content_elem.appendChild(infobox)
	content_elem.innerHTML += DrawGroupCounts(player.events);
	return new_dom.serialize();
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"
	
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"
	content.appendChild(upperbox)
	let title = document.createElement("h1")
	
	title.innerHTML = player.name
	content.appendChild(title)

	return content;
}

function DrawGroupCounts(events) {
	
	// assuming max 20 groups
	let groups = [0,0,0,0,0,0]
	
	for (let eventname of Object.keys(events)) {
		let event = events[eventname];
		
		groups[event.group - 1] += 1
	}

	return `<canvas id="myChart" width="400" height="400"></canvas>
	<script>
	var ctx = document.getElementById('myChart').getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'doughnut',
		data: {
			labels: ['Lohko 1', 'Lohko 2', 'Lohko 3', 'Lohko 4', 'Lohko 5', 'Lohko 6'],
			datasets: [{
				label: '# of Votes',
				data: ${JSON.stringify(groups)},
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	});
	</script>
	`
}

function DrawAverageGroup(events) {
	
	let groups = []

	for (let eventname of Object.keys(events)) {
		let event = events[eventname];
		groups.push(event.group)
	}

	

	let mean = groups.reduce((prev, cur) => cur += prev) / groups.length;

	return `<div class="infoline">Keskimääräinen lohko: ${mean.toFixed(2)}</div>`
}

function DrawBestWeek(events) {
	
	let best_week_id
	let best_week_score
	let best_week_date
	let best_week_points = -100

	for (let eventname of Object.keys(events)) {
		let event = events[eventname];

		//console.log(best_week_points +" vs "+event.points)
		if (best_week_points < event.points || (event.points == best_week_points && best_week_score < event.event_score)) {
			best_week_id = eventname
			best_week_points = parseInt(event.points)
			best_week_date = event.date
			best_week_score = event.event_score
		}
	}

	return `<div class="bestweek_container">Eniten pisteitä viikolla: <a href='../${best_week_id}.html' class='bestweek'> ${best_week_date}, ${best_week_points} pistettä </a></div>`
}

function DrawEventsChart(player_events) {
	
	let season_data = {};
	var i=0
	let dates = []
	let events = []
	let points = []

	for (let eventname of Object.keys(player_events)) {
		
		let event = player_events[eventname];

		if (!season_data[event.season])
			season_data[event.season] = ""

		season_data[event.season] += "{x: "+(i++)+", y:"+event.event_score+"},"
		dates.push(event.date)
		events.push(eventname)
		points.push(event.points)
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

	return '<canvas id="canvas"></canvas>' + `<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
		<div id="canvas-holder1" style="width:75%;">
			<div class="chartjs-tooltip" id="tooltip"></div>
		</div>
	<script>
const WIDE_CLIP = {top: 2, bottom: 4};

Chart.canvasHelpers.clipArea = function(ctx, clipArea) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      clipArea.left,
      clipArea.top - WIDE_CLIP.top,
      clipArea.right - clipArea.left,
      clipArea.bottom - clipArea.top + WIDE_CLIP.bottom
    );
    ctx.clip();
};
		var events = `+JSON.stringify(events)+`
		var points = `+JSON.stringify(points)+`
		var dates = `+JSON.stringify(dates)+`

		var customTooltips = function(tooltip) {
			//$(this._chart.canvas).css('cursor', 'pointer');
			var positionY = this._chart.canvas.offsetTop + 4;
			var positionX = this._chart.canvas.offsetLeft + 55;
			
			if (!tooltip || !tooltip.opacity) {
				return;
			}
			if (tooltip.dataPoints.length > 0) {
				tooltip.dataPoints.forEach(function(dataPoint) {
					let index = dataPoint.xLabel;
					var content = ["Pisteet: <b>"+dataPoint.yLabel+"</b>", "Eräpisteet: <b>"+points[index]+"</b>", dates[index]].join('<br>');
					var $tooltip = $('#tooltip');//-' + dataPoint.datasetIndex);
					$tooltip.html("<a href='../"+events[index]+".html' class='blaa'>"+content+"</a>");
					$tooltip.css({
						opacity: 1,
						top: positionY + dataPoint.y + 'px',
						left: positionX + dataPoint.x + 'px',
					});
				});
			}
		};
		
		var config = {
			type: 'scatter',
			data: {
				labels: 'Seasons',
				datasets: [`+dataset+`]
			},
			options: {
				responsive: true,
				title: {
					display: true,
					lineHeight: 2,
					padding: 1,
					text: 'Tapahtumapisteet'
				},
				tooltips: {
					mode: 'nearest',
					enabled: false,
					intersect: false,
					titleFontSize: 12,
					custom: customTooltips,
					callbacks: {
						label: function(tooltipItem, data) {
							let dou = data.datasets[tooltipItem.datasetIndex].label;
							return tooltipItem.yLabel + " <b>(" + dates[tooltipItem.xLabel]+")</b>"
						}
					}

				},
				hover: {
					mode: 'nearest',
					intersect: true
				},
				scales: {
					xAxes: [{
						display: false,
						scaleLabel: {
							display: true,
							labelString: 'Month'
						}
					}],
					yAxes: [{
						display: true,
						scaleLabel: {
							display: false,
							labelString: 'Value'
						}
					}]
				}
			}
		};

		window.onload = function() {
			var canvas = document.getElementById('canvas')
			var ctx = canvas.getContext('2d');
			window.myLine = new Chart(ctx, config);

			document.getElementById('content').addEventListener("mouseout", function(event) {
				
				if (document.querySelector("#content :hover"))
					return;

				$('.chartjs-tooltip').css({
					opacity: 0,
				});
			})

			canvas.onclick = function(evt){
			    var activePoints = window.myLine.getElementAtEvent(evt);
			    // => activePoints is an array of points on the canvas that are at the same position as the click event.
			    console.log(activePoints[0])
			};
		};
</script>`;

}