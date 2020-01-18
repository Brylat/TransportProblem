const kMeansVisualisation = {
	init: function () {
		init();
	},
	buildClusters: function (array) {
		buildClusters(array);
	},
	drawClustersVisualisation: function () {
		drawClusters();
	},
	removeMarkers: function () {
		removeMarkers();
	},
	addToRoute: function (array) {
		addToRoute(array);
	},
	buildRoute: function () {
		buildRoute();
	},
	drawRoute: function () {
		drawRoute();
	}
}
var baseCoordinates = [50.06446, 19.94503]

var earth;
var markers = [];
var colors = [];
var colorsRoute = [];
var icons = [];
var index = 0;
var coordinatesToFocus = [];
var routeTemp = [];

var routes = [];

var foundPoints = 0;

function init() {
	earth = new WE.map('earth_div');
	colors = ['#f60404', '#f8e604', '#66ff33', '#000000', '#00ffcc', '#0039e6', '#b3b3cc', '#ff4dff'];
	colorsRoute = ['#f60404', '#f8e604', '#66ff33', '#000000', '#00ffcc', '#0039e6', '#b3b3cc', '#ff4dff'];
	icons = ['icons/9.png', 'icons/8.png', 'icons/7.png', 'icons/6.png', 'icons/5.png', 'icons/4.png', 'icons/3.png', 'icons/2.png', 'icons/1.png', ];
	WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '� OpenStreetMap contributors'
	}).addTo(earth);
}

function buildClusters(pointsArray) {
	pointsArray.map(p=> foundPoints = foundPoints + p.location.length)
	
	var icon = icons.pop();
	var carIndex = ++index;
	pointsArray.map(points => {
		setFocusCoordinates(points.location);
		markers.push(WE.marker(points.location, icon, 25, 25).bindPopup("<b>Punk dla samochodu nr: " + carIndex +"</b><br>Miejscowosc: " + points.name + " <br /><span style='font-size:10px;color:#999'>Koordynaty: " + points.location + "</span>", {maxWidth: 150, closeButton: true}));
	})
	addWarehouseToMap();
}

function addWarehouseToMap() {
	markers.push(WE.marker(baseCoordinates, 'icons/warehouse.png', 35, 35).bindPopup("<b>Magazyn glowny </b><br>Miejscowosc: Krakow<br /><span style='font-size:10px;color:#999'>Koordynaty: " + baseCoordinates + "</span>", {maxWidth: 150, closeButton: true}));
}

function setFocusCoordinates(points) {
	if(index == 1) {
		coordinatesToFocus = points;
	}
}

function drawClusters() {
	this.markers.map(marker => marker.addTo(earth));
	earth.setZoom(5);
	earth.panTo(coordinatesToFocus, 1);
	
	console.log("przypisane miasta: " + foundPoints/2);
}

function removeMarkers() {
	markers.map(marker => marker.removeFrom(earth));
	markers = [];
	index = 0;
	coordinatesToFocus = [0,0];
}

function addToRoute(array) {
	routeTemp.push(array);
}

function buildRoute() {
	addBaseToRoutes();
	var route = WE.polygon(routeTemp, {
          color: colorsRoute.pop(),
          opacity: 0,
          fillColor: '#f00',
          fillOpacity: 0.01,
          weight: 4
        })
		routes.push(route);
		
		clearTempRoute();
}

function addBaseToRoutes() {
	routeTemp.push(baseCoordinates);
	routeTemp.unshift(baseCoordinates);
}

function clearTempRoute() {
	this.routeTemp = [];
}

function drawRoute() {
	routes.map(route => route.addTo(earth));
}
