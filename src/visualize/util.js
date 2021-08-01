
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

	// order events by id
	for (tag of Object.keys(events_by_series)) {
		events_by_series[tag] = events_by_series[tag].sort((x, y) => y[0] - x[0])

	}
	return events_by_series;
}
