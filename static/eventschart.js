
const eventTooltip = function(tooltip, chart) {
    //$(chart.canvas).css('cursor', 'pointer');
    const positionY = chart.canvas.offsetTop + 4;
    const positionX = chart.canvas.offsetLeft + 55;

    if (!tooltip || !tooltip.opacity) {
        return;
    }
    if (!tooltip.dataPoints.length)
        return;

    tooltip.dataPoints.forEach(function(dataPoint) {
        const raw = chart.data.datasets[dataPoint.datasetIndex].data[dataPoint.index];
        const event = raw.event;

        const content = [
            `<b>Tapahtuma ${event.date}</b>`,
            ``,
            `<b>${event.points}</b> pistettä`,
            `Lohko: <b>${event.group}</b>`,
            `Pallopisteet: <b>${event.points}</b>`
        ].join('<br>');

        const $tooltip = $('#tooltip');//-' + dataPoint.datasetIndex);
        $tooltip.html(`<a href='../`+raw.event_name+`.html' class='blaa'>`+content+`</a>`);
        $tooltip.css({
            opacity: 1,
            top: positionY + dataPoint.y + 'px',
            left: positionX + dataPoint.x + 'px',
        });
    });
};

function eventsChart(datasets) {

    Chart.canvasHelpers.clipArea = function(ctx, clipArea) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(
            clipArea.left,
            clipArea.top - 2,
            clipArea.right - clipArea.left,
            clipArea.bottom - clipArea.top + 4
        );
        ctx.clip();
    };

    var chartConfig = {
        type: 'scatter',
        data: {
            labels: 'Seasons',
            datasets
        },
        options: {
            responsive: true,
            title: {
                display: true,
                lineHeight: 2,
                padding: 1,
                text: 'Tapahtumapisteet'
            },
            tooltips: {
                mode: 'nearest',
                enabled: false,
                intersect: false,
                titleFontSize: 12,
                custom: function(tooltip) {eventTooltip(tooltip, this._chart)}

            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    display: false,
                    scaleLabel: {
                        display: true,
                        labelString: 'Month'
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: false,
                        labelString: 'Value'
                    }
                }]
            }
        }
    };

    window.onload = function() {
        var canvas = document.getElementById('canvas')
        var ctx = canvas.getContext('2d');
        window.myLine = new Chart(ctx, chartConfig);

        document.getElementById('content').addEventListener("mouseout", function(event) {
            
            if (document.querySelector("#content :hover"))
                return;

            $('.chartjs-tooltip').css({
                opacity: 0,
            });
        })
    };
}