const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawBiggestRisers = function (events) {
	let content = document.createElement("div")
    content.classList.add("rankinglist")
	content.innerHTML +=   "<h2>Viikon nousijat</h2>"
	content.innerHTML += DrawPlayersByChange(events)

	return content;
}

function DrawPlayersByChange(events) {
    
    events = events.sort((a, b) => b.id - a.id)

    // Two latest events from both women and men
    let groups = events[0].date != events[1].date ?    
        events[0].groups :
        events[0].groups.concat(events[1].groups);
            
    
    let players = groups
        .map(x => x.players)
        .flat()
        .filter(x => x.rank_old != null)
        .map(x => {x.rank_change_i = x.rank_new - x.rank_old; return x})
        .sort((a, b) => b.rank_change_i - a.rank_change_i)

    let risers = ""

    const LIST_LENGTH = 5
    if (players.length < LIST_LENGTH)
        return "---";

    for (let i = 0; i <= LIST_LENGTH - 1; i++) {
        risers += `<div class="riser">${i+1}. <a href="p/${players[i].name}.html">${players[i].name}</a> ${players[i].rank_change}</div>`;

    }

	return `<div class="recentevent">${risers}</div>`;

}