const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;


exports.DrawRoundsBox = function (group) {

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

function StylizePlayerName(name) {

	return name ? `<span class="name">${name}</span>` : "<i>lisävahvistus</i>";
}
