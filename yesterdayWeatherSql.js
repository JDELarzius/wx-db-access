const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
var charts = {};

$( document ).ready(function() {
	reloadView();
});

function reloadView() {
	var sStation = '';
    if (window.location.href.indexOf('jake') > 0) {
		sStation = 'jake';
	} else if (window.location.href.indexOf('mary') > 0) {
		sStation = 'mary';
	} else if (window.location.href.indexOf('paul') > 0) {
		sStation = 'paul';
	}

	let tempType = $("input[name='tempType']:checked").val();
	if(tempType !== 'F' && tempType !== 'C') {
		tempType = 'F';
	}

	setStationInfo(stationData.stationInfo);
	setObservations(stationData.graphData, tempType);
}

function setStationInfo(stationInfo) {
	$('#stationLocation').text(`${stationInfo.Location} (${stationInfo.StationLat}N, ${stationInfo.StationLon}W)`);
	$('#cocorahsId').text(stationInfo.CoCoRaHSID)
}


function setObservations(targetDayData, tempType) {
	let observationTimes = [];
	let temps = [];
	let heatIndexes = [];
	let windChills = [];
	let winds = [];
	let windDirections = [];
	let todayRain = [];
	let rainRates = [];
	let humidities = [];
	let dewPoints = [];
	let pressures = [];

	//Set the date
	let dataDate = targetDayData[0].ObservationLocalDate;
	$('#day').text(dataDate);
	
	//Push today's data into the data array
	for(let i = 0; i < targetDayData.length; i++) {
		let thisObservationTime = new Date(targetDayData[i].ObservationLocalDate + 'T' + targetDayData[i].ObservationLocalTime)
		observationTimes.push(thisObservationTime);
		
		//Temperatures
		temps.push(convertTemperature(targetDayData[i].Temperature, tempType));
		heatIndexes.push(convertTemperature(targetDayData[i].HeatIndex, tempType));
		windChills.push(convertTemperature(targetDayData[i].WindChill, tempType));
		
		//Winds
		winds.push(targetDayData[i].WindSpeed);
		windDirections.push(targetDayData[i].WindDirection);
		
		//Rains
		//Weather link doesn't clear previous day rainfall until 12:01am, so go ahead and set the 12:00am to 0
		if(i === 0 && thisObservationTime.getHours() === 0 && thisObservationTime.getMinutes() === 0) {
			todayRain.push(0.00);
		} else {
			todayRain.push(targetDayData[i].DayRain);
		}
		rainRates.push(targetDayData[i].RainRate);
		
		//Atmosphere
		humidities.push(targetDayData[i].Humidity);
		dewPoints.push(convertTemperature(targetDayData[i].DewPoint, tempType));
		pressures.push(targetDayData[i].Pressure);
	}

	
	//Push information from midnight today into the array
	// oMidnightObservation = new Date(oTodayData.Data[0].ObservationLocalDate);
	// if(oMidnightObservation.getHours() === 0 && oMidnightObservation.getMinutes() === 0) {
	// 	observationTimes.push(oMidnightObservation);
	// 	temps.push(convertTemperature(oTodayData.Data[0].Temperature, tempType));
	// 	heatIndexes.push(convertTemperature(oTodayData.Data[0].HeatIndex, tempType));
	// 	windChills.push(convertTemperature(oTodayData.Data[0].WindChill, tempType));
	// 	winds.push(oTodayData.Data[0].WindSpeed);
	// 	windDirections.push(oTodayData.Data[0].WindDirectionLetter);
	// 	todayRain.push(oTodayData.Data[0].TodayRain);
	// 	rainRates.push(oTodayData.Data[0].RainRate);
	// 	humidities.push(oTodayData.Data[0].Humidity);
	// 	dewPoints.push(convertTemperature(oTodayData.Data[0].DewPoint, tempType));
	// 	pressures.push(oTodayData.Data[0].Pressure);
	// }
	
	//Temperatures chart
	if(charts.temperature !== undefined) { charts.temperature.destroy(); }
	charts.temperature = new Chart(document.getElementById('tempChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: temps,
					label: 'Temperature',
					borderColor: 'DarkGreen',
					backgroundColor: 'rgba(0, 100, 0, 0.4)'
				},{
					data: heatIndexes,
					label: 'Heat Index',
					hidden: true,
					borderColor: 'Red',
					backgroundColor: 'rgba(178, 34, 34, 0.4)'
				},{
					data: windChills,
					label: 'Wind Chill',
					hidden: true,
					borderColor: 'Blue',
					backgroundColor: 'rgba(0, 0, 255, 0.4)'
				}
			]
		},
		options: {
			spanGaps: true,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'hour'
					}
				}],
				yAxes: [
					{
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: '°' + tempType
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem, oData) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, oData) {
						let sLabel = oData.datasets[oToolTipItem.datasetIndex].label + ': ';
						return sLabel + oToolTipItem.yLabel.toFixed(1) + ' °' + tempType;
					}
				}
			}
		}
	});
	
	//Winds chart
	if(charts.wind !== undefined) { charts.wind.destroy(); }
	charts.wind = new Chart(document.getElementById('windChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: winds,
					label: 'Winds',
					borderColor: 'Blue',
					backgroundColor: 'rgba(0, 0, 255, 0.4)'
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'hour'
					}
				}],
				yAxes: [
					{
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: 'Wind Speed (mph)'
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, b) {
						return oToolTipItem.value + ' mph from the ' + windDirections[oToolTipItem.index]; 
					}
				}
			}
		}
	});
	
	//Rain Chart
	if(charts.rain !== undefined) { charts.rain.destroy(); }
	charts.rain = new Chart(document.getElementById('rainChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: todayRain,
					label: 'Rainfall',
					borderColor: 'DarkGreen',
					backgroundColor: 'rgba(0, 100, 0, 0.4)',
					yAxisID: 'Rain'
				},{
					data: rainRates,
					label: 'Rain Rate',
					hidden: true,
					borderColor: 'Green',
					backgroundColor: 'rgba(0, 128, 0, 0.4)',
					yAxisID: 'RainRate'
				}
			]
		},
		options: {
			spanGaps: true,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [
					{
						type: 'time',
						time: {
							unit: 'hour'
						}
					}
				],
				yAxes: [
					{
						id: 'Rain',
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: 'Total Rainfall (in)'
						}
					}, 
					{
						id: 'RainRate',
						type: 'linear',
						position: 'right',
						scaleLabel: {
							display: true,
							labelString: 'Rain Rate (in/hr)'
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem, oData) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, oData) {
						let sLabel = oData.datasets[oToolTipItem.datasetIndex].label + ': ';
						return sLabel + oToolTipItem.value + '"'
					}
				}
			}
		}
	});
	
	//Humidity chart
	if(charts.humidity !== undefined) { charts.humidity.destroy(); }
	charts.humidity = new Chart(document.getElementById('humidityChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: humidities,
					label: 'Humidity',
					borderColor: 'MediumOrchid',
					backgroundColor: 'rgba(186, 85, 211, 0.4)'
				}
			]
		},
		options: {
			spanGaps: true,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'hour'
					}
				}],
				yAxes: [
					{
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: '%'
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem, oData) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, oData) {
						let sLabel = oData.datasets[oToolTipItem.datasetIndex].label + ': ';
						return sLabel + oToolTipItem.value + '%'
					}
				}
			}
		}
	});
	
	//Dew Point Chart
	if(charts.dewPoint !== undefined) { charts.dewPoint.destroy(); }
	charts.dewPoint = new Chart(document.getElementById('dewPointChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: dewPoints,
					label: 'Dew Point',
					borderColor: 'DarkGreen',
					backgroundColor: 'rgba(0, 100, 0, 0.4)',
				}
			]
		},
		options: {
			spanGaps: true,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'hour'
					}
				}],
				yAxes: [
					{
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: ' °' + tempType
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem, oData) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, oData) {
						let sLabel = oData.datasets[oToolTipItem.datasetIndex].label + ': ';
						return sLabel + oToolTipItem.yLabel.toFixed(1) + ' °' + tempType;
					}
				}
			}
		}
	});
	
	//Pressure Chart
	if(charts.pressure !== undefined) { charts.pressure.destroy(); }
	charts.pressure = new Chart(document.getElementById('pressureChart'), {
		type: 'line',
		data: { 
			labels: observationTimes,
			datasets: [{
					data: pressures,
					label: 'Pressure',
					borderColor: 'DimGray',
					backgroundColor: 'rgba(105, 105, 105, 0.4)'
				}
			]
		},
		options: {
			spanGaps: true,
			responsive: true,
			maintainAspectRatio: false,
			scales: {
				xAxes: [{
					type: 'time',
					time: {
						unit: 'hour'
					}
				}],
				yAxes: [
					{
						type: 'linear',
						position: 'left',
						scaleLabel: {
							display: true,
							labelString: 'inHg'
						}
					}
				]
			},
			tooltips: {
				callbacks: {
					title: function(oToolTipItem, oData) {
						let dLabelDate = new Date(oToolTipItem[0].label);	
						let sDateLabel = DAYS[dLabelDate.getDay()] + ', ' + MONTHS[dLabelDate.getMonth()] + ' ' + dLabelDate.getDate() + ', ' + dLabelDate.getFullYear() + ', ';
						let sTimeLabel = getTimeStringFromDate(dLabelDate);
						return sDateLabel + sTimeLabel;
					},
					label: function(oToolTipItem, oData) {
						let sLabel = oData.datasets[oToolTipItem.datasetIndex].label + ': ';
						return sLabel + oToolTipItem.value + ' inHg'
					}
				}
			}
		}
	});
}

function getTimeString(timeString) {
	if(timeString === undefined || timeString === null) {
		return '';
	}
	
	let iHours = parseInt(timeString.substring(0,2));
	let sMinutes = timeString.substring(3,5);
	let sHours = '';
	let sAmPm = '';
	if(iHours === 0) {
		sHours = '12';
		sAmPm = 'am';
	} else if(iHours > 12) {
		sHours = (iHours - 12).toString();
		sAmPm = 'pm'
	} else {
		sHours = iHours.toString();
		sAmPm = iHours === 12 ? 'pm' : 'am'
	}
	
	return sHours + ':' + sMinutes + sAmPm;
}

function getTimeStringFromDate(oDate) {
	if(oDate === undefined || oDate === null) {
		return '';
	}
	
	let iHours = oDate.getHours();
	let sMinutes = oDate.getMinutes().toString();
	let sHours = '';
	let sAmPm = '';
	if(iHours === 0) {
		sHours = '12';
		sAmPm = 'am';
	} else if(iHours > 12) {
		sHours = (iHours - 12).toString();
		sAmPm = 'pm'
	} else {
		sHours = iHours.toString();
		sAmPm = iHours === 12 ? 'pm' : 'am'
	}
	
	if(sMinutes.length === 1) {
		sMinutes = '0' + sMinutes;
	}
	
	return sHours + ':' + sMinutes + sAmPm;
}

function getDisplayTemp(tempF, tempType) {
	return convertTemperature(tempF, tempType).toFixed(1) + ' °' + tempType;
}

function convertTemperature(tempF, tempType) {
	return tempType === 'C' ? (tempF - 32) * (5/9) : tempF;
}