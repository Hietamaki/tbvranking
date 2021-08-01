
exports.ListEventsBySeries = function (events) {

	const events_by_series = {};

	for (event of events) {
		for (tag of event.tags) {
			if (!tag.match(/^\d{4}-\w$/))
				continue;
			if (!events_by_series[tag])
				events_by_series[tag] = [];
			
			events_by_series[tag].push([event.id, event.date]);
		}
	}
	return events_by_series;
}
