const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawBiggestRisers = function (events) {
	let content = document.createElement("div")
	content.innerHTML +=   "<h2>Viikon isoimmat nousijat</h2>"
	content.innerHTML += Biggest(events)

	return content;
}

function Biggest(events) {
    //console.log(events)
    
    let groups = events[0].groups.concat(events[1].groups)
    
    let players = groups
        .map(x => x.players)
        .flat()
        .filter(x => x.rank_old != null)
        .map(x => {x.rank_change_i = x.rank_new - x.rank_old; return x})
        .sort((a, b) => b.rank_change_i - a.rank_change_i)

    let risers = ""

    for (let i = 0; i <= 5; i++) {
        risers += `<div class="riser">${i+1}. ${players[i].name} ${players[i].rank_change}</div>`;

    }
    
	return `<div class="recentevent">${risers}</div>`;

}