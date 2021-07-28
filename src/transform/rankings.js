// Returns collection of rankings
//  {eventid: ranking[]} object
exports.GetRankings = function(events) {
    events = events.sort((e1, e2) => e1.id > e2.id);
   
    let rankings = events[0].groups
        .reduce((prev, g) => {console.log(g); prev.concat(g.map(g => g.players)), []})
    console.log(rankings);
    for (event of events) {
        for (group of event.groups) {
            for (player of group.players)
                rankings.push([player.name, player.rank_new, event.id])
        }
    }
    let season = events[0].series;
};
