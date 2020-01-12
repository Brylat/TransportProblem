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
	}
}

var earth;
var markers = [];
var colors = [];
var icons = [];
var index = 0;
var coordinatesToFocus = [];

function init() {
	earth = new WE.map('earth_div');
	colors = ['#f60404', '#f8e604', '#66ff33', '#000000', '#00ffcc', '#0039e6', '#b3b3cc', '#ff4dff'];
	icons = ['icons/9.png', 'icons/8.png', 'icons/7.png', 'icons/6.png', 'icons/5.png', 'icons/4.png', 'icons/3.png', 'icons/2.png', 'icons/1.png', ];
	WE.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: '© OpenStreetMap contributors'
	}).addTo(earth);
}

function buildClusters(pointsArray) {
	var icon = icons.pop();
	var carIndex = ++index;
	pointsArray.map(points => {
		setFocusCoordinates(points);
		markers.push(WE.marker(points, icon, 25, 25).bindPopup("<b>Punk dla samochodu nr: " + carIndex +"</b><br>Miejscowosc: todo przekazac to<br /><span style='font-size:10px;color:#999'>Koordynaty: " + points + "</span>", {maxWidth: 150, closeButton: true}));
	})
}

function setFocusCoordinates(points) {
	if(index == 1) {
		coordinatesToFocus = points;
	}
}

function drawClusters() {
	this.markers.map(marker => marker.addTo(earth));
	earth.setZoom(2.5);
	earth.panTo(coordinatesToFocus, 1);
}

function removeMarkers() {
	markers.map(marker => marker.removeFrom(earth));
	markers = [];
	index = 0;
	coordinatesToFocus = [0,0];
}
