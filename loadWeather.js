const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

var charts = {};

$( document ).ready(function() {
	reloadView();
});

function reloadView() {
	var sStation = '';
	$('canvas').empty();

	let tempType = $("input[name='tempType']:checked").val();
	if(tempType !== 'F' && tempType !== 'C') {
		tempType = 'F';
	}

	
	let stationInfo = stationData.stationInfo;
	let currentObservation = stationData.currentObservation;
	let todayData = stationData.graphData;
	let highsAndLows = stationData.highsAndLows;
	
	let station = stationInfo.StationName.substring(0,4).toLowerCase();

	setStationInfo(stationInfo);
	setObservationTime(currentObservation.ObservationLocalDate, currentObservation.ObservationLocalTime, currentObservation.ObservationUTC, stationInfo.TimeZone);
	setCurrentObservations(currentObservation, highsAndLows, tempType);
	setTodayObservations(currentObservation, highsAndLows, todayData, tempType);
	setWebcamImage(station);
}

function setStationInfo(stationInfo) {
	$('#stationLocation').text(`${stationInfo.Location} (${stationInfo.StationLat}N, ${stationInfo.StationLon}W)`);
	$('#cocorahsId').text(stationInfo.CoCoRaHSID)
}

function setCurrentObservations(currentObservation, highsAndLows, tempType) {
	//Temperatures
	$('#currenttemp').text(getDisplayTemp(currentObservation.Temperature, tempType));
	$('#heatindex').text(getDisplayTemp(currentObservation.HeatIndex, tempType));
	$('#windchill').text(getDisplayTemp(currentObservation.WindChill, tempType));
	$('#hitemp').text(getDisplayTemp(highsAndLows.HighTemp, tempType) + ' at ' + getTimeString(highsAndLows.HighTempTime));
	$('#lowtemp').text(getDisplayTemp(highsAndLows.LowTemp, tempType) + ' at ' + getTimeString(highsAndLows.LowTempTime));
	$('#hiheatindex').text(getDisplayTemp(highsAndLows.HighHeatIndex, tempType) + ' at ' + getTimeString(highsAndLows.HighHeatIndexTime));
	$('#lowwindchill').text(getDisplayTemp(highsAndLows.LowWindChill, tempType) + ' at ' + getTimeString(highsAndLows.LowWindChillTime));

	//Winds
	$('#currentwind').text(currentObservation.WindSpeed + ' mph from the ' + currentObservation.WindDirection);
	$('#tenminavgwind').text(currentObservation.Wind10MinAverage + ' mph');
	$('#highwind').text(highsAndLows.HighWindGust + ' mph  at ' + getTimeString(highsAndLows.HighWindGustTime));
	
	//Rain
	$('#dayrain').text(currentObservation.DayRain + 'in');
	$('#stormrain').text(currentObservation.StormRain + 'in');
	$('#monthrain').text(currentObservation.MonthRain + 'in');
	$('#yearrain').text(currentObservation.YearRain + 'in');
	$('#rainrate').text(currentObservation.RainRate + 'in/hr');
	let rainRateTime = getTimeString(highsAndLows.HighRainRateTime);
	if(rainRateTime !== '') {
		$('#highrainrate').text(highsAndLows.HighRainRate + 'in/hr at ' + rainRateTime);
	} else {
		$('#highrainrate').text('N/A');
	}
	
	//Atmospheric Conditions
	$('#humidity').text(currentObservation.Humidity + '%');
	$('#dewPoint').text(getDisplayTemp(currentObservation.DewPoint, tempType));
	$('#pressure').text(currentObservation.Pressure + ' inHg');
}

function setTodayObservations(currentObservation, highsAndLows, todayData, tempType) {
	let tempChartXAxis = [];
	let windChartXAxis = [];
	let rainChartXAxis = [];
	let atmosphereChartXAxis = [];
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
	
	let highTempTime = new Date(highsAndLows.Date + 'T' + highsAndLows.HighTempTime);
	let lowTempTime = new Date(highsAndLows.Date + 'T' + highsAndLows.LowTempTime);
	let highWindTime = new Date(highsAndLows.Date + 'T' + highsAndLows.HighWindGustTime);
	let highRainRateTime = new Date(highsAndLows.Date + 'T' + highsAndLows.HighRainRateTime);
	
	//Push today's data into the data array
	for(let i = 0; i < todayData.length; i++) {
		let thisObservationTime = new Date(todayData[i].ObservationLocalDate + 'T' + todayData[i].ObservationLocalTime);
		let nextObservationTime;
		if( i === todayData.length - 1) {
			nextObservationTime = new Date(currentObservation.ObservationLocalDate + 'T' + currentObservation.ObservationLocalTime);
		} else {
			nextObservationTime = new Date(todayData[i + 1].ObservationLocalDate + 'T' + todayData[i + 1].ObservationLocalTime);
		}
		
		tempChartXAxis.push(thisObservationTime);
		windChartXAxis.push(thisObservationTime);
		rainChartXAxis.push(thisObservationTime);
		atmosphereChartXAxis.push(thisObservationTime);
		
		//Temperatures
		temps.push(convertTemparature(todayData[i].Temperature, tempType));
		heatIndexes.push(convertTemparature(todayData[i].HeatIndex, tempType));
		windChills.push(convertTemparature(todayData[i].WindChill, tempType));
		if(highTempTime > thisObservationTime && highTempTime < nextObservationTime) {
			tempChartXAxis.push(highTempTime);
			temps.push(convertTemparature(highsAndLows.HighTemp, tempType));
			heatIndexes.push(null);
			windChills.push(null);
		}
		if(lowTempTime > thisObservationTime && lowTempTime < nextObservationTime) {
			tempChartXAxis.push(lowTempTime);
			temps.push(convertTemparature(highsAndLows.lowTemp, tempType));
			heatIndexes.push(null);
			windChills.push(null);
		}
		
		//Winds
		//It's possible to have a much higher gust during one of our regular observation points that 
		//isn't at the actual snapshot time, so use our high wind gust time if the time matches exaclty
		winds.push( highWindTime.getTime() === thisObservationTime.getTime() ? currentObservation.HiWindSpeed : todayData[i].WindSpeed);
		windDirections.push(todayData[i].WindDirection);
		if(highWindTime > thisObservationTime && highWindTime < nextObservationTime) {
			windChartXAxis.push(highWindTime);
			winds.push(highsAndLows.HighWindGust); 
			//Just assume the direction of the closest observation we have data for
			if(highWindTime - thisObservationTime < nextObservationTime - highWindTime ||
				i === todayData.length - 1) {
				//Use the direction from the previous observation
				windDirections.push(todayData[i].WindDirection);
			} else {
				windDirections.push(todayData[i+1].WindDirection);
			}
		}
		
		//Rains
		//Weather link doesn't clear previous day rainfall until 12:01am, so go ahead and set the 12:00am to 0
		if(i === 0 && thisObservationTime.getHours() === 0 && thisObservationTime.getMinutes() === 0) {
			todayRain.push(0.00);
		} else {
			todayRain.push(todayData[i].DayRain);
		}
		rainRates.push( highRainRateTime.getTime() === thisObservationTime.getTime() ? currentObservation.HiRainRate : todayData[i].RainRate);
		if(highRainRateTime > thisObservationTime && highRainRateTime < nextObservationTime) {
			rainChartXAxis.push(highRainRateTime);
			winds.push(currentObservation.HiRainRate);
			todayRain.push(null);
		}
		
		//Atmosphere
		//Nothing special for these, just push the values
		humidities.push(todayData[i].Humidity);
		dewPoints.push(convertTemparature(todayData[i].DewPoint, tempType));
		pressures.push(todayData[i].Pressure);
	}
	
	//Push information from the most recent observation into the array, if it is newer
	let dLastTodayObservationTime = new Date(todayData[todayData.length - 1].ObservationLocalDate + 'T' + todayData[todayData.length - 1].ObservationLocalTime);
	let dCurrentObservationTime = new Date(currentObservation.ObservationLocalDate + 'T' + currentObservation.ObservationLocalTime);
	if(dCurrentObservationTime > dLastTodayObservationTime) {
		tempChartXAxis.push(dCurrentObservationTime);
		windChartXAxis.push(dCurrentObservationTime);
		rainChartXAxis.push(dCurrentObservationTime);
		atmosphereChartXAxis.push(dCurrentObservationTime);
		temps.push(convertTemparature(currentObservation.Temperature, tempType));
		heatIndexes.push(convertTemparature(currentObservation.HeatIndex, tempType));
		windChills.push(convertTemparature(currentObservation.WindChill, tempType));
		winds.push(currentObservation.WindSpeed);
		windDirections.push(currentObservation.WindDirection);
		todayRain.push(currentObservation.DayRain);
		rainRates.push(currentObservation.RainRate);
		humidities.push(currentObservation.Humidity);
		dewPoints.push(convertTemparature(currentObservation.DewPoint, tempType));
		pressures.push(currentObservation.Pressure);
	}
	
	//Temperatures chart
	if(charts.temperature !== undefined) { charts.temperature.destroy(); }
	charts.temperature = new Chart(document.getElementById('tempChart'), {
		type: 'line',
		data: { 
			labels: tempChartXAxis,
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
					title: function(oToolTipItem) {
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
			labels: windChartXAxis,
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
			labels: rainChartXAxis,
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
			labels: atmosphereChartXAxis,
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
			labels: atmosphereChartXAxis,
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
						return sLabel + oToolTipItem.value + ' °F'
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
			labels: atmosphereChartXAxis,
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

function setObservationTime(localObservationDate, localObservationTime, utcObservationTime, timeZone) {
	let timeDiff = (new Date() - Date.UTC(utcObservationTime.substring(0,4), 
												utcObservationTime.substring(5,7) - 1, 
												utcObservationTime.substring(8,10), 
												utcObservationTime.substring(11,13),
												utcObservationTime.substring(14,16))) / 60000;
	
	let dateDisplay = localObservationDate + ' ' + getTimeString(localObservationTime) + ' (' + timeZone + ' Time)';
	
	if(timeDiff > 10) {
		//Observation is old!
		$('#lastUpdate').css('color', 'red');
		dateDisplay += ' (not a current observation)';
	}
	
	$('#lastUpdate').text(dateDisplay);
}

function setWebcamImage(sStation) {
	let sQueryString = '?d=' + Date.now();
	let sImageSource = '/weather/' + sStation + '/webcam.jpg' + sQueryString;
	
	$('#webcam').empty().prepend('<img src="' + sImageSource + '">');
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
	return convertTemparature(tempF, tempType).toFixed(1) + ' °' + tempType;
}

function convertTemparature(tempF, tempType) {
	return parseFloat(tempType === 'C' ? (tempF - 32) * (5/9) : tempF);
}

//Click handlers
function showHumidityClick() {
	$('#showHumidity').css('display', 'none');
	$('#showDewPoint').css('display', '');
	$('#showPressure').css('display', '');
	$('#humidityContainer').css('display', '');
	$('#dewPointContainer').css('display', 'none');
	$('#pressureContainer').css('display', 'none');
}

//Click handlers
function showDewPointClick() {
	$('#showHumidity').css('display', '');
	$('#showDewPoint').css('display', 'none');
	$('#showPressure').css('display', '');
	$('#humidityContainer').css('display', 'none');
	$('#dewPointContainer').css('display', '');
	$('#pressureContainer').css('display', 'none');
}

//Click handlers
function showPressureClick() {
	$('#showHumidity').css('display', '');
	$('#showDewPoint').css('display', '');
	$('#showPressure').css('display', 'none');
	$('#humidityContainer').css('display', 'none');
	$('#dewPointContainer').css('display', 'none');
	$('#pressureContainer').css('display', '');
}