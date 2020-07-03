const jsdom = require('jsdom');
const fs = require("fs");
const nedb = require("nedb");

const db = new nedb({filename: "events.db", autoload: true});
const { JSDOM } = jsdom;

// tällä pästään käsiksi documentin metodeihin missä instanssilla ei oikeasti ole väliä
var document;

var events_by_series = {};

var html_doc_header= "<!DOCTYPE html><head><meta charset='utf-8'><meta name='viewport'\
 content='width=device-width, initial-scale=1'><title>TBV tulospalvelu</title>\
 <link rel='stylesheet' href='style.css'><script src='client.js'></script></head>"+ `
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

db.find({}, function(err, events) {

	ListEventsBySeries(events)

	for (event of events) {
		console.log("Visualizing event: "+event.id)

		fs.writeFile("./html/"+event.id+".html", GenerateHTML(event), (err) => {
		    if (err)
		    	console.log(err);
		});
	}
});

function ListEventsBySeries(events) {

	for (event of events) {
		for (tag of event.tags) {
			if (!tag.match(/^\d{4}-\w$/))
				continue;
			if (!events_by_series[tag])
				events_by_series[tag] = [];
			
			events_by_series[tag].push([event.id, event.date]);
		}
	}
}

function GenerateHTML(event) {

	var new_dom = (new JSDOM(html_doc_header));
	document = new_dom.window.document;

	let content_elem = DrawContentDiv()
	document.body.appendChild(content_elem)

	let lohko = 1

	for (let group of event.groups) {
		if (!group)
			continue;

		let group_elem = document.createElement("div")
		group_elem.innerHTML = "<h2>Lohkon "+(lohko++)+" tulokset</h2>"

		group_elem.appendChild(DrawScoreTable(group, event.date))
		group_elem.appendChild(DrawRoundsBox(group))
		content_elem.appendChild(group_elem)
	}

	return new_dom.serialize();
}

function DrawContentDiv() {
	let content = document.createElement("div")
	content.id = "content"
	
	let upperbox = document.createElement("div")
	upperbox.id = "upperbox"
	content.appendChild(upperbox)

	upperbox.innerHTML = "<span class='guide'>VALITSE KISATAPAHTUMA:</span><br>";

	for (page of Object.keys(events_by_series).sort().reverse())
		upperbox.appendChild(DrawSerieDropdown(page))

	let title = document.createElement("h1")
	
	title.innerHTML = event.tags[0].slice(0, 7).trim() + ": "+event.date
	content.appendChild(title)

	return content;
}

function StylizePlayerName(name) {

	return name ? `<span class="name">${name}</span>` : "<i>lisävahvistus</i>";
}

function DrawRoundsBox(group) {

	function CreateRoundRow(group, round) {

		//scoreboard is anchored to first in group's perspective
		const anchor_score = group.games[round - 1];

		const winners_positions = CalculateWinnersPositions(anchor_score, round);
		const [winner1, winner2] = GetNamesFromPositions(group.players, winners_positions);

		return `<tr><td>${round}. erän voittajat:</td>`
			+ `<td>${StylizePlayerName(winner1)} & ${StylizePlayerName(winner2)}</td>`
			+ `<td><span class='points'>+${Math.abs(anchor_score)}`
			+ "</span></td></tr>";
	}

	// For this round and anchor score, what are the starting positions of winners?
	function CalculateWinnersPositions(anchor_score, round) {

		// Player at position 1 plays first with 4th, 3rd and last with 2nd position
		const partner_position = 5 - round;
		
		return anchor_score > 0
			? [1, partner_position]
			: [2, 3, 4].filter(position => position !== partner_position);
	}

	function GetNamesFromPositions(players, start_positions) {
		return players
			.filter(p => start_positions.includes(p.start_position))
			.sort((p1, p2) => (p2.score) - (p1.score))
			.map(p => p.name);
	}

	const rounds_table = document.createElement("table")
	rounds_table.classList.add("roundscores")
	rounds_table.innerHTML	= CreateRoundRow(group, 1)
							+ CreateRoundRow(group, 2)
							+ CreateRoundRow(group, 3);
	
	const box = document.createElement("div")
	box.classList.add("games")
	box.appendChild(rounds_table)

	return box;
}

function CreateCol(classname) {
	let col = document.createElement("col");
	col.classList.add(classname);
	return col;
}

function DrawScoreTable(group, date) {
	
	let table = document.createElement("table")
	table.appendChild(CreateCol("position"));
	table.appendChild(CreateCol("name"));
	table.appendChild(CreateCol("points"));

	var position_state = {
		placement: [1, 2, 3, 4],
		i: 0,
		previous_score: ""
	}

	for (let competitor of group.players) {

		let row = document.createElement("tr");

		row.appendChild(DrawPositionCell(competitor, position_state))
		row.appendChild(DrawNameCell(competitor))
		row.appendChild(DrawPointsCell(competitor))
		row.appendChild(DrawRankingCell(competitor, date))

		table.appendChild(row)
	}

	return table
}

function DrawPositionCell(competitor, state) {

	let cell_position = document.createElement("td");
		
	if (state.previous_score === competitor.score) 
		state.placement[state.i] = state.placement[state.i-1]
	else
		cell_position.innerHTML = `<span class="position">${state.placement[state.i]}. </span>`

	state.previous_score = competitor.score
	state.i++

	return cell_position
}

function DrawNameCell(competitor) {

	let cell_name = document.createElement("td");
	cell_name.innerHTML = StylizePlayerName("<a href='p/"+competitor.name+".html'>"+competitor.name+"</a>");

	return cell_name;
}

function DrawPointsCell(competitor) {
	let cell_points = document.createElement("td");
	cell_points.classList.add("points")
	let points = Number(competitor.score).toFixed(0);
	cell_points.innerHTML = `<span class="points">${points}</span>`

	return cell_points;
}

function DrawRankingCell(competitor, date) {

	let cell_ranking = document.createElement("td");

	let formula_explanation = "Lohkosijoitus ("
			+ (competitor.event_score - competitor.score * getBallScore(date)).toFixed(2)
			+ ") + eräpistekerroin (" + (competitor.score * getBallScore(date)).toFixed(2) + ")";

			if (competitor.event_score == 22)
				formula_explanation = "Maksimipisteet saavutettu < 22"

	if (competitor.rank_old) {
		let last_week_score = (competitor.rank_new - competitor.event_score).toFixed(2);
		let last_last_week_score = (competitor.rank_old - last_week_score).toFixed(2);

		cell_ranking.innerHTML = " Ranking: <b>"+ competitor.rank_new+"</b> = \
			<span class='active tooltip'>"	+competitor.event_score +
			"<span class='tooltiptext'>"+formula_explanation+"</span></span> + " +
			"<span class='active'>"+last_week_score
			+"</span>, <span class='old'>"+last_last_week_score+"</span>";
	}
	else
		cell_ranking.innerHTML = " <span class='new'>Uusi pelaaja</span>"

	let difference = competitor.rank_new - competitor.rank_old

	cell_ranking.innerHTML += " (muutos "

	if (difference.toFixed(2) > 0)
		cell_ranking.innerHTML += "+"
	cell_ranking.innerHTML += difference.toFixed(2)+") "
	//cell_ranking.innerHTML += "/"+(competitor.rank_old / 2).toFixed(2)

	cell_ranking.addEventListener("mouseover", hovering)

	return cell_ranking;
}


function hovering(ev) {
	console.log(ev.target)
}

function getBallScore(date) {
	if (date.split(".")[2] >= 2020)
		return 0.05;
	else
		return 0.045;
}

function DrawSerieDropdown(type) {

	let menubox = document.createElement("div")
	let menubutton = document.createElement("button")
	let menu = document.createElement("div")

	menubox.classList.add("dropdown")
	menubutton.setAttribute("onclick", "openMenu('"+type+"')")
	menubutton.classList.add("dropbtn")

	if (event.tags.includes(type))
		menubutton.classList.add("dropbtnactive");

	menubutton.innerHTML = type
	menu.id = "dropdown-"+type
	menu.classList.add("dropdown-content")

	menubox.appendChild(menubutton);
	menubox.appendChild(menu)

	for (page of events_by_series[type].sort().reverse()) {
		let link = document.createElement("a");
		link.href = page[0]+".html"

		if (event.id == page[0])
			link.id = "active"
		link.innerHTML = page[1]
		menu.appendChild(link)
	}

	return menubox
}
