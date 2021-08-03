const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawRank = function (player) {
    //console.log(player)
	let content = document.createElement("div")
    content.classList.add("rank-container");
	content.innerHTML += `<a href="../${player.series}.html"><div class='rank'>Sija: ${player.rank}</div><span class='rank-subtext'>Kilpailee sarjassa ${player.series}</span></a>`;
	//content.innerHTML += Biggest(events);
    if (!player.rank)
        content.innerHTML = "";
    
	return content;
}

function Biggest(events) {
    
    events = events.sort((a, b) => b.id - a.id)

    // Two latest events from both women and men
    let groups = events[0].series == events[1].series ?    
        events[0].groups :
        events[0].groups.concat(events[1].groups);
            
    
    let players = groups
        .map(x => x.players)
        .flat()
        .filter(x => x.rank_old != null)
        .sort((a, b) => b.rank_new - a.rank_new)

    let risers = ""
    console.log(players);

    if (players.length < 8)
        return "---";

    for (let i = 0; i <= 7; i++) {
        risers += `<div class="riser">${i+1}. <a href="p/${players[i].name}.html">${players[i].name}</a> ${players[i].rank_change}</div>`;
    }

	return `<div class="recentevent">${risers}</div>`;

}