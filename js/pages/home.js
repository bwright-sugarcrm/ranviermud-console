function getCurrentPlayerData(lastDate, series) {
	$.post('/php/home/getCurrentPlayerData.php', {
		lastDate: lastDate
	}, function(data) {
		for (var i = 0; i < data.length; i++) {
			series.addPoint([data[i].dt, data[i].count], true, true);
			if (data[i].dt > currentPlayersDate) { currentPlayersDate = data[i].dt; }
		}
	}, 'json');
}

function getDailyPlayerData(axis, maxHigh, avgHigh) {
	$.post('/php/home/getDailyPlayerData.php', {
	}, function(data) {
		axis.setCategories(data.axis);
		maxHigh.setData(data.maxHigh);
		avgHigh.setData(data.avgHigh);
	}, 'json');
}


var currentPlayersDate = '';

$(document).ready(function() {
	Highcharts.setOptions({
		global: {
			useUTC: false
		}
	});

	var activePlayers;
	activePlayers = new Highcharts.Chart({
		chart: {
			renderTo: 'activePlayersGraph',
			type: 'spline',
			marginRight: 10,
			events: {
				load: function() {

					// set up the updating of the chart each second
					var series = this.series[0];
					setInterval(function() {
						getCurrentPlayerData(currentPlayersDate, series);
					}, 60000);
				}
			}
		},
		title: {
			text: 'Current Players'
		},
		xAxis: {
			type: 'datetime',
			tickPixelInterval: 150
		},
		yAxis: {
			title: {
				text: 'Value'
			},
			min: 0,
			allowDecimals: false,
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]
		},
		tooltip: {
			formatter: function() {
					return '<b>'+ this.series.name +'</b><br/>'+
					Highcharts.dateFormat('%m/%d/%Y %l:%M %p', this.x) +'<br/>'+
					Highcharts.numberFormat(this.y, 0);
			}
		},
		legend: {
			enabled: false
		},
		series: [{
			name: 'Current Players',
			data: (function() {
				// generate an array of random data
				var data = [],
					counts = JSON.parse($('#currentPlayers').text());
				$('#currentPlayers').remove();
				
				for (i = 0; i < counts.length; i++) {
					data.push({
						x: counts[i].dt,
						y: counts[i].count
					});
					if (currentPlayersDate == '') { currentPlayersDate = counts[i].dt; }
					if (counts[i].dt > currentPlayersDate) { currentPlayersDate = counts[i].dt; }
				}
				return data;
			})()
		}]
	});
	
	var monthly;
	
	monthly = new Highcharts.Chart({
		chart: {
			renderTo: 'monthlyPlayersGraph',
			events: {
				load: function() {

					// set up the updating of the chart each second
					var maxHigh = this.series[0];
					var avgHigh = this.series[1];
					var axis = this.xAxis[0];
					getDailyPlayerData(axis, maxHigh, avgHigh);
					setInterval(function() {
						getDailyPlayerData(axis, maxHigh, avgHigh);
					}, (60000 * 15));
				}
			}
		},
		title: {
			text: 'Monthly Players'
		},
		xAxis: {
			categories: []
		},
		yAxis: {
			title: {
				text: 'Players'
			},
			min: 0,
			allowDecimals: false,
			plotLines: [{
				value: 0,
				width: 1,
				color: '#808080'
			}]
		},
		tooltip: {
			formatter: function() {
				return '<b>'+ this.series.name +'</b><br/>'+
				this.x +'<br/>'+
				Highcharts.numberFormat(this.y, 3);
			}
		},
		series: [{
			type: 'column',
			name: 'Max High',
			data: []
		}, {
			type: 'spline',
			name: 'Average High',
			data: [],
			marker: {
				lineWidth: 0,
				lineColor: Highcharts.getOptions().colors[1]
			}
		}
		]
	});
});