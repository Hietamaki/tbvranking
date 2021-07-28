
exports.GetPlayers = function (players, date) {

	players.reduce((position, player, i) => {
		if (i > 0) {
			if (players[i-1].score !== player.score) {
				position = i + 1
				player.position_shared = false;
			}
			else
				player.position_shared = true;
		}
		player.end_position = position;
		return position;
	}, 1);


	return players.map(p => CalculatePlayerScores(p, date))
}

function CalculatePlayerScores(player, date) {

	const difference = (player.rank_new - player.rank_old).toFixed(2);
	const add_sign = difference > 0 ?  "+" : "";

	player.rank_change = add_sign + difference;
	player.ball_score = (player.score * getBallScore(date)).toFixed(2);
	player.placement_score = (player.event_score - player.ball_score);
	player.last_week_score = (player.rank_new - player.event_score).toFixed(2);
	player.last_last_week_score = (player.rank_old - player.last_week_score).toFixed(2);

	return player;
}

function getBallScore(date) {
	if (date.split(".")[2] >= 2020)
		return 0.05;
	else
		return 0.045;
}