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

	const score = group.scores[round - 1];
	const [winner1, winner2] = group.winners[round - 1];

	return `<tr><td>${round}. erän voittajat:</td>`
		+ `<td>${StylizePlayerName(winner1)} & ${StylizePlayerName(winner2)}</td>`
		+ `<td><span class='points'>+${score}</span></td></tr>`;
}

function StylizePlayerName(name) {
	return name ? `<span class="name">${name}</span>` : "<i>lisävahvistus</i>";
}
