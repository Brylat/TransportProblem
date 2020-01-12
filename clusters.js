
const clusters = {

  data: getterSetter([], function(initialData) {
    var n = initialData[0].coordinates.length;
    return (initialData.map(function(array) {
      return array.coordinates.length == n;
    }).reduce(function(boolA, boolB) { return (boolA & boolB) }, true));
  }),

  clusters: function() {
    var pointsAndCentroids = kmeans(this.data(), {k: this.k(), iterations: this.iterations(), singleCapacity: this.capacity() });
    var points = pointsAndCentroids.points;
    var centroids = pointsAndCentroids.centroids;

    return centroids.map(function(centroid) {
      return {
        centroid: centroid.location(),
        points: points.filter(function(point) { return point.label() == centroid.label() }).map(function(point) { return point.location() }),
      };
    });
  },

  k: getterSetter(undefined, function(value) { return ((value % 1 == 0) & (value > 0)) }),
  capacity: getterSetter(undefined, function(value) { return ((value % 1 == 0) & (value > 0)) }),
  iterations: getterSetter(Math.pow(10, 3), function(value) { return ((value % 1 == 0) & (value > 0)) }),

};

function kmeans(data, config) {
  // default k
  var k = config.k || Math.round(Math.sqrt(data.length / 2));
  var singleCapacity = config.singleCapacity || 10;
  var iterations = config.iterations;

  // initialize point objects with data
  var points = data.map(function(vector) { return new Point(vector.coordinates, vector.capacity) });

  // intialize centroids randomly #AJ add randomly
  var centroids = [];
  for (var i = 0; i < k; i++) {
    centroids.push(new Centroid(points[i % points.length].location(), i));
  };

  // update labels and centroid locations until convergence
  for (var iter = 0; iter < iterations; iter++) {
    points.forEach(function(point) { point.updateLabel(centroids, points, singleCapacity) });
    centroids.forEach(function(centroid) { centroid.updateLocation(points) });
  };

  // return points and centroids
  return {
    points: points,
    centroids: centroids
  };

};

// objects
function Point(location, capacity) {
  var self = this;
  this.location = getterSetter(location);
  this.label = getterSetter();
  this.capacity = getterSetter(capacity);
  this.updateLabel = function(centroids, points, groupCapacity) {
    var distancesSquared = centroids
        .map(function(centroid) {
      return sumOfSquareDiffs(self.location(), centroid.location());
    });
    var centroidIndex = mindex(distancesSquared);
    var selectedCentroid = centroids[centroidIndex];
    var usedCapacity = selectedCentroid.getUsedCapacity(points);
    while (usedCapacity + self.capacity > groupCapacity) {
      var pointsInCentroid = points.filter(function(point) { return point.label() == selectedCentroid.label() });
      var sortedPoints = pointsInCentroid.sort((a, b) => a.capacity() - b.capacity());
      if (sortedPoints.length > 0){
        sortedPoints[0].label(-1);
      }
    }
    self.label(centroidIndex);
  };
};

function Centroid(initialLocation, label) {
  var self = this;
  this.location = getterSetter(initialLocation);
  this.label = getterSetter(label);
  this.updateLocation = function(points) {
    var pointsWithThisCentroid = points.filter(function(point) { return point.label() == self.label() });
    if (pointsWithThisCentroid.length > 0) self.location(averageLocation(pointsWithThisCentroid));
  };
  this.getUsedCapacity = function(points) {
    var pointsWithThisCentroid = points.filter(function(point) { return point.label() == self.label() });
    return pointsWithThisCentroid.reduce((acc, curr) => { return acc + curr.capacity() }, 0)
  }
};

// convenience functions
function getterSetter(initialValue, validator) {
  var thingToGetSet = initialValue;
  var isValid = validator || function(val) { return true };
  return function(newValue) {
    if (typeof newValue === 'undefined') return thingToGetSet;
    if (isValid(newValue)) thingToGetSet = newValue;
  };
};

function sumOfSquareDiffs(oneVector, anotherVector) {
  var squareDiffs = oneVector.map(function(component, i) {
    return Math.pow(component - anotherVector[i], 2);
  });
  return squareDiffs.reduce(function(a, b) { return a + b }, 0);
};

function mindex(array) {
  var tmpArr = array;
  var min = tmpArr.reduce(function(a, b) {
    return Math.min(a, b);
  }, Number.MAX_VALUE);
  if (tmpArr && tmpArr.length > 0) {
    return array.indexOf(min);
  } else {
    return -1;
  } 
};

function sumVectors(a, b) {
  return a.map(function(val, i) { return val + b[i] });
};

function averageLocation(points) {
  var zeroVector = points[0].location().map(function() { return 0 });
  var locations = points.map(function(point) { return point.location() });
  var vectorSum = locations.reduce(function(a, b) { return sumVectors(a, b) }, zeroVector);
  return vectorSum.map(function(val) { return val / points.length });
};
