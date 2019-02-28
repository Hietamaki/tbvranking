const jsdom = require('jsdom');
const fs = require("fs");
const nedb = require("nedb");

const db = new nedb({filename: "events.db", autoload: true});
const pdb = new nedb({filename: "players.db", autoload: true});
const { JSDOM } = jsdom;

// tällä pästään käsiksi documentin metodeihin missä instanssilla ei oikeasti ole väliä
var document;

var events_by_series = {};

var html_doc_header= "<!DOCTYPE html><head><meta charset='utf-8'><meta name='viewport'\
 content='width=device-width, initial-scale=1'><title>TBV tulospalvelu</title>\
 <link rel='stylesheet' href='../style.css'><script src='../client.js'></script>\
 <script src='Chart.bundle.min.js'></script>\
 <script src='utils.js'></script>"+ `
</head>
<!-- Matomo -->
<script type="text/javascript">
  var _paq = _paq || [];
  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="//sake.kapsi.fi/anal/";
    _paq.push(['setTrackerUrl', u+'piwik.php']);
    _paq.push(['setSiteId', '2']);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.type='text/javascript'; g.async=true; g.defer=true; g.src=u+'piwik.js'; s.parentNode.insertBefore(g,s);
  })();
</script>
<!-- End Matomo Code -->
`;

pdb.find({}, function(err, players) {

	for (player of players) {
		console.log("Visualizing player: "+player.name)

		fs.writeFile("./html/p/"+player.name+".html", GenerateHTML(player), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});


function GenerateHTML(player) {

	var new_dom = (new JSDOM(html_doc_header));
	document = new_dom.window.document;
	
	let content_elem = DrawContentDiv()
	document.body.appendChild(content_elem)

	//let previous_group = []
	let lohko = 1

	content_elem.innerHTML += '<canvas id="canvas"></canvas>';
	
	//let rarr = "";
	//let rerr = "";
	let lul = {};
	var i=0
	let dates = []
	let events = []
	let points = []

	for (let eventname of Object.keys(player.events)) {
		
		let event = player.events[eventname];

		if (!lul[event.season])
			lul[event.season] = ""

		lul[event.season] += "{x: "+(i++)+", y:"+event.event_score+"},"
		dates.push(event.date)
		events.push(eventname)
		points.push(event.points)

		

		//rarr += event.event_score +","
		//rerr += event.points +","

		//console.log(group)
		//let group_elem = document.createElement("div")
		//group_elem.innerHTML = "<h2>Lohkon "+(lohko++)+" tulokset</h2>"

		//group_elem.appendChild(DrawPositionScores(group, previous_group))
		//group_elem.appendChild(DrawScoreTable(group))
		//group_elem.appendChild(DrawRoundsBox(group))
		//content_elem.appendChild(group_elem)

		//previous_group = group;
	}

	let label = Object.entries(lul)[0][1];
	let dataset = ""

	if (Object.entries(lul)[1]) {
		dataset = `
		,{
			label: '`+Object.entries(lul)[1][0]+`',
			backgroundColor: window.chartColors.blue,
			borderColor: window.chartColors.blue,
			data: [
				`+Object.entries(lul)[1][1]+`
			],
			fill: false,
			showLine: true,
		}`

		label += Object.entries(lul)[1][1]
	}

	content_elem.innerHTML += `<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>
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
				labels: 'Lul dataset',
				datasets: [{
					label: '`+Object.entries(lul)[0][0]+`',
					backgroundColor: window.chartColors.red,
					borderColor: window.chartColors.red,
					data: [
						`+Object.entries(lul)[0][1]+`
					],
					fill: false,
					showLine: true,
				}`+dataset+`]
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
	
	return new_dom.serialize();
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"
	
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"
	content.appendChild(upperbox)
/*
	upperbox.innerHTML = "<span class='guide'>VALITSE KISATAPAHTUMA:</span><br>";

	for (page of Object.keys(events_by_series).sort().reverse())
		upperbox.appendChild(DrawSerieDropdown(page))
*/
	let title = document.createElement("h1")
	
	title.innerHTML = player.name
	content.appendChild(title)

	return content;
}
