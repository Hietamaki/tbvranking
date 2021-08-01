exports.DrawGroupsMeanChart = function (events) {
	
	let groups = {}

	for (let eventname of Object.keys(events)) {
		let event = events[eventname]
		if (!groups[event.season])
			groups[event.season] = []
		groups[event.season].push(event.group)
	}

	let means = {}

	for (let group of Object.keys(groups)) {
		let season_mean = groups[group].reduce((prev, cur) => cur += prev) / groups[group].length;
		means[group] = season_mean;
	}

    console.log(JSON.stringify(Object.keys(means)))
    console.log(JSON.stringify(Object.values(means)))

	return `<canvas id="myChart" width="400" height="400"></canvas>
	<script>
	var ctx = document.getElementById('myChart').getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'scatter',
		data: {
			labels: ${JSON.stringify(Object.keys(means))},
			datasets: [{
				label: '# of Votes',
				data: ${JSON.stringify(Object.values(means))},
				backgroundColor: [
					'rgba(255, 99, 132, 0.2)',
					'rgba(54, 162, 235, 0.2)',
					'rgba(255, 206, 86, 0.2)',
					'rgba(75, 192, 192, 0.2)',
					'rgba(153, 102, 255, 0.2)',
					'rgba(255, 159, 64, 0.2)'
				],
				borderColor: [
					'rgba(255, 99, 132, 1)',
					'rgba(54, 162, 235, 1)',
					'rgba(255, 206, 86, 1)',
					'rgba(75, 192, 192, 1)',
					'rgba(153, 102, 255, 1)',
					'rgba(255, 159, 64, 1)'
				],
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				y: {
					beginAtZero: true
				}
			}
		}
	});
	</script>
	`
}