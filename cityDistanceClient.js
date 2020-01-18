const cityDistanceClient = {
	download: function (pointsArray) {
		download(pointsArray);
	}
}

var index = 0;
function download(pointsArray) {
	pointsArray.map(point1 => {
		pointsArray.map(point2 => {
			if (index <= 15) {
				this.index = index++;
				if (point1 == point2) {
					console.log("to juz jest");
					return;
				}
				var httpResponse = getCityDistances(point1, point2);
				var obj = JSON.parse(httpResponse);
				console.log("{ cityStart: \"" + point1.cityName + "\", cityEnd: \"" + point2.cityName + "\", distance: " + obj.routes[0].distance + ", duration: " + obj.routes[0].duration + " },");
			}

		})
	});
}

function getCityDistances(point1, point2) {
	var httpResponse = httpGet(point1, point2);
	if (httpResponse == "{\"message\":\"Too Many Requests\"}") {
		console.log("too many requests -> sleep");
		sleepFor(10000);
		return getCityDistances(point1, point2);
	}
	return httpResponse;
}

function httpGet(coordinates1, coordinates2) {
	var httpUrlString = "http://router.project-osrm.org/route/v1/driving/" + coordinates1.coordinates[1] + "," + coordinates1.coordinates[0] + ";" + coordinates2.coordinates[1] + "," + coordinates2.coordinates[0] + "?overview=false";
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.open("GET", httpUrlString, false);
	xmlHttp.send(null);
	return xmlHttp.responseText;
}

function sleepFor(sleepDuration) {
	var now = new Date().getTime();
	while (new Date().getTime() < now + sleepDuration) {
	}
}
