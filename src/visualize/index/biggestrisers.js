const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawBiggestRisers = function (events) {
	let content = document.createElement("div")
	content.innerHTML +=   "<h2>Viikon nousijat</h2>"
	content.innerHTML += Biggest(events)

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
        .map(x => {x.rank_change_i = x.rank_new - x.rank_old; return x})
        .sort((a, b) => b.rank_change_i - a.rank_change_i)

    let risers = ""

    if (players.length < 8)
        return "---";

    for (let i = 0; i <= 7; i++) {
        risers += `<div class="riser">${i+1}. <a href="p/${players[i].name}.html">${players[i].name}</a> ${players[i].rank_change}</div>`;

    }

	return `<div class="recentevent">${risers}</div>`;

}