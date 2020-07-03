const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawScoreTable = function (group, date) {
	
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

function CreateCol(classname) {
	let col = document.createElement("col");
	col.classList.add(classname);
	return col;
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

function StylizePlayerName(name) {
	return `<span class="name">${name}</span>`;
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

