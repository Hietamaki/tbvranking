const { JSDOM } = require('jsdom');
const document = (new JSDOM()).window.document;

exports.DrawRanking = function (players, season) {
    console.log(players)
	let content = document.createElement("div")
	content.innerHTML +=   "<h2>Ranking "+season+"</h2>"
	content.innerHTML += Biggest(players, season)

	return content;
}

function Biggest(players, season) {
    

	var lol = players
		.filter(x => x.season == season)
		.sort((a,b) => b.rank_score - a.rank_score)

    var risers = "";

    for (let i = 0; i < lol.length; i++) {
        risers += `<div class="riser">${i+1}. <a href="p/${lol[i].name}.html">${lol[i].name}</a></div>`;

    }

	return `<div class="recentevent">${risers}</div>`;

}