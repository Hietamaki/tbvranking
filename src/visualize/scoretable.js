const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawScoreTable = function (group) {
	
	let table = document.createElement("table")
	table.appendChild(CreateCol("position"));
	table.appendChild(CreateCol("name"));
	table.appendChild(CreateCol("points"));

	for (let player of group.players) {

		let row = document.createElement("tr");

		row.appendChild(DrawPositionCell(player))
		row.appendChild(DrawNameCell(player))
		row.appendChild(DrawPointsCell(player))
		row.appendChild(DrawRankingCell(player))

		table.appendChild(row)
	}

	return table
}

function CreateCol(classname) {
	let col = document.createElement("col");
	col.classList.add(classname);
	return col;
}

function DrawPositionCell(player, prev_position) {

	let cell_position = document.createElement("td");
		
	if (!player.position_shared) 
		cell_position.innerHTML = `<span class="position">${player.end_position}. </span>`

	return cell_position
}

function DrawNameCell(player) {

	let cell_name = document.createElement("td");
	cell_name.innerHTML = `
		<a class="name" href='p/${player.name}.html'>${player.name}</a>`;

	return cell_name;
}

function DrawPointsCell(player) {
	let cell_points = document.createElement("td");
	cell_points.classList.add("points")
	let points = Number(player.score).toFixed(0);
	cell_points.innerHTML = `<span class="points">${points}</span>`

	return cell_points;
}

function DrawRankingCell(player) {

	const cell_ranking = document.createElement("td");

	const formula_explanation = player.event_score == 22
		? "Maksimipisteet saavutettu < 22"
		: `Lohkosijoitus (${player.placement_score}) + eräpisteet (${player.ball_score})`;

	cell_ranking.innerHTML = player.rank_old
		?
			" Ranking: <b>"+ player.rank_new+"</b> = \
			<span class='active tooltip'>"	+player.event_score +
			"<span class='tooltiptext'>"+formula_explanation+"</span></span> + " +
			"<span class='active'>"+player.last_week_score
			+"</span>, <span class='old'>"+player.last_last_week_score+"</span>"
		:
			"<span class='new'>Uusi pelaaja</span>";

	cell_ranking.innerHTML += ` (muutos ${player.rank_change}) `;

	return cell_ranking;
}


