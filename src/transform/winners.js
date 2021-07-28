
exports.GetWinners = function (group) {

	const winners = [];
	for (round = 1; round <= 3; round++) {
		//scoreboard is anchored to first in group's perspective
		const anchor_score = group.scores[round - 1];
		const winners_positions = CalculateWinnersPositions(anchor_score, round);
		winners.push(GetNamesFromPositions(group.players, winners_positions));
	}
	return winners;
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