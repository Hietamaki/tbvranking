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

	//let previous_group = []
	let lohko = 1

	for (let group of event.groups) {
		if (!group)
			continue;

		//console.log(group)
		let group_elem = document.createElement("div")
		group_elem.innerHTML = "<h2>Lohkon "+(lohko++)+" tulokset</h2>"

		//group_elem.appendChild(DrawPositionScores(group, previous_group))
		group_elem.appendChild(DrawScoreTable(group, event.date))
		group_elem.appendChild(DrawRoundsBox(group))
		content_elem.appendChild(group_elem)

		//previous_group = group;
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

function StylizeName(name) {
	return `<span class="name">${name}</span>`
}

function hovering(ev) {
	console.log(ev.target)
}

function ListPlayersInWinningOrder(group) {

	let players = []

	for (let competitor of group.players)
		players[competitor.start_position] = competitor.name;

	return players
}

function DrawPositionScores(group, previous_group) {

	//calculus

	starting_scores = [];
	for (competitor of group.players) {
		if (competitor.rank_old)
			starting_scores.push((competitor.rank_old / 2).toFixed(2));
	}

	if (starting_scores.length < 4) {
		starting_scores.splice(starting_scores.indexOf(Math.min(...starting_scores).toFixed(2)), 1);

		let previous_scores = [];

		for (hmmm of previous_group.players)
			previous_scores.push(hmmm.rank_old/2)

		previous_scores.sort(function(a, b) {
  			return a - b;
		});

		starting_scores.push(previous_scores[0]).toFixed(2)

		if (starting_scores.length <2) {
			starting_scores.push(previous_scores[1]).toFixed(2)
		}
	}

	max = Math.max(...starting_scores).toFixed(2);
	min = Math.min(...starting_scores).toFixed(2);

	//layout
	var text = document.createElement("div");
	text.innerHTML = "Jaossa olevat sijoituspisteet ovat "+max +" – "+min

	return text;
}

function DrawRoundsBox(group) {

	var players = ListPlayersInWinningOrder(group);

	function HigherWinnerFirst(p1, p2) {

		if (!p2)
			if (!p1)
				return "<i>täytepelaaja</i> & <i>täytepelaaja</i>"
			else
				return StylizeName(p1) + " & <i>täytepelaaja</i>"

		if (Number((group.players.find(who => who.name == p1)).score) >
			Number((group.players.find(who => who.name == p2)).score))
			return StylizeName(p1) + " & " + StylizeName(p2)
		else
			return StylizeName(p2) + " & " + StylizeName(p1)
	}

	function MatchString(round, p) {
		if (group.games[round-1] > 0) {
			return "<tr><td>Erän "+round+". voittajat:</td><td> "
				+ HigherWinnerFirst(players[1], players[p])
				+`</td><td><span class="points">+${group.games[round-1]}</span></td></tr>`;
		}
		else {
			let others = [2, 3, 4]
			others = others.filter(item => item !== p)
			return "<tr><td>Erän "+round+". voittajat:</td><td> "
				+ HigherWinnerFirst(players[others[0]], players[others[1]])
				+"</td><td><span class='points'>+"+Math.abs(group.games[round-1])
				+"</span></td></tr>";
		}
	}

	let box = document.createElement("div")
	box.classList.add("games")

	let rounds_table = document.createElement("table")
	rounds_table.classList.add("roundscores")
	
	rounds_table.innerHTML	= MatchString(1, 4)
							+ MatchString(2, 3)
							+ MatchString(3, 2);

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
	cell_name.innerHTML = StylizeName("<a href='p/"+competitor.name+".html'>"+competitor.name+"</a>");

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
