function City(name, location) {
    this.name = name;
    this.location = location;
}

function Population(initialData = [], startCity, useLinearDistanse = true, populationCount = 50) {
    var self = this;
    this.initialData = initialData;
    this.startCity = new City(startCity.cityName, startCity.coordinates);
    this.count = populationCount;
    this.cityCount = initialData.length;
    this.paths = [];
    this.cities = [];
    this.distances = [];
    this.fitness = [];
    this.bestPath = 0;
    this.useElitism = true;
    this.mutationRate = 0.05;
    this.crossSize = 2;
    this.useLinearDistanse = useLinearDistanse;
    this.bestDistanceEver = 999999999999999;
    this.cityDistanceMatrixRepository = cityDistanceMatrix;


    this.init = () => {
        this.cityDistanceMatrixRepository.init();
        this.initCities();
        this.initPaths();
        this.updateDistance();
        this.updateFitness();
    }

    this.evolve = () => {
        this.crossover();
        this.mutation();
        this.updateDistance();
        this.updateFitness();
    }

    this.initCities = function () {
        var i = 0;
        this.initialData.forEach(element => {
            this.cities[i] = new City(element.name, element.location);
            i++;
        });
    };

    this.initPaths = function () {
        var path = [];
        for (var j = 0; j < this.cityCount; j++) {
            path.push(j);
        }
        for (var i = 0; i < this.count; i++) {
            shuffle(path);
            this.paths.push(path.slice());
        }
    };

    this.updateDistance = function () {
        for (var i = 0; i < this.count; i++) {
            var sum = 0;
            for (j = 0; j < this.cityCount - 1; j++) {
                this.useLinearDistanse
                    ? sum += getLinearDistance(this.cities[this.paths[i][j]], this.cities[this.paths[i][j + 1]])
                    : sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.cities[this.paths[i][j]].name, this.cities[this.paths[i][j + 1]].name);

            }
            if (this.useLinearDistanse) {
                sum += getLinearDistance(this.startCity, this.cities[0]);
                sum += getLinearDistance(this.cities[this.cities.length - 1], this.startCity);
            }
            else {
                sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.startCity.name, this.cities[0].name);
                sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.cities[this.cities.length - 1].name, this.startCity.name);
            }

            this.distances[i] = sum;
            if (sum < this.distances[this.bestPath]) {
                this.bestPath = i;
            }

            if (sum < this.bestDistanceEver)
                this.bestDistanceEver = sum;
        }
    }

    this.updateFitness = function () {
        for (i = 0; i < this.count; i++) {
            this.fitness[i] = 1 / this.distances[i];
        }
    }

    this.crossover = function () {
        var parentA, parentB;
        var childA = [], childB = [];

        parentA = this.findBest();
        parentB = this.findBest([parentA]);


        childA = Array(this.cityCount).fill(-1);
        childB = Array(this.cityCount).fill(-1);

        var crossPos = Math.floor(Math.random(this.cityCount - this.crossSize));

        for (var i = 0; i < this.cityCount; i++) {
            if (i >= crossPos && i <= crossPos + this.crossSize) {
                childA[i] = this.paths[parentA][i];
            }
        }
        for (var i = 0, j = 0; i < this.cityCount; i++) {
            while (childA[j] != -1 && j < this.cityCount) j++;

            if (childA.indexOf(this.paths[parentB][i]) == -1) {
                childA[j++] = this.paths[parentB][i];
            }
        }

        crossPos = Math.floor(Math.random(this.cityCount - this.crossSize));
        for (var i = 0; i < this.cityCount; i++) {
            if (i >= crossPos && i <= crossPos + this.crossSize) {
                childB[i] = this.paths[parentB][i];
            }
        }
        for (var i = 0, j = 0; i < this.cityCount; i++) {

            while (childB[j] != -1 && j < this.cityCount) j++;

            if (childB.indexOf(this.paths[parentA][i]) == -1) {
                childB[j++] = this.paths[parentA][i];
            }
        }

        var worstPathA = this.findWorst();
        var worstPathB = this.findWorst([worstPathA]);
        this.paths[worstPathA] = childA;
        this.paths[worstPathB] = childB;
    }

    this.mutation = function () {
        if (this.mutationRate < Math.random()) {
            var pathindex;

            var currentBestPath = this.findBest();

            for (pathindex = 0; pathindex < this.count; pathindex++) {

                if (this.useElitism === true && currentBestPath == pathindex) {
                    continue;
                }
                var cityindexA = Math.floor(Math.random(this.cityCount));
                var cityindexB = Math.floor(Math.random(this.cityCount));

                swap(this.paths[pathindex], cityindexA, cityindexB);
            }
        }
    }

    this.findBest = function (ignoreList) {
        var best = 0;
        ignoreList = ignoreList || [];

        for (i = 0; i < this.count; i++) {
            var ignore = false;
            for (j = 0; j < ignoreList.length; j++) {
                if (i == ignoreList[j]) {
                    ignore = true;
                }

                if (best == ignoreList[i]) {
                    best++;
                }
            }

            if (ignore === true) {
                continue;
            }

            if (this.fitness[i] > this.fitness[best])
                best = i;

        }

        return best;
    }

    this.findWorst = function (ignoreList) {
        var worst = 0;
        ignoreList = ignoreList || [];

        for (i = 0; i < this.count; i++) {
            var ignore = false;
            for (j = 0; j < ignoreList.length; j++) {
                if (i == ignoreList[j]) {
                    ignore = true;
                }

                if (worst == ignoreList[i]) {
                    worst++;
                }
            }

            if (ignore === true) {
                continue;
            }

            if (this.fitness[i] < this.fitness[worst])
                worst = i;

        }

        return worst;
    }
}

function swap(a, i, j) {
    var temp = a[i];
    a[i] = a[j];
    a[j] = temp;
}


function shuffle(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function sumOfSquareDiffs(oneVector, anotherVector) {
    var squareDiffs = oneVector.map(function (component, i) {
        return Math.pow(component - anotherVector[i], 2);
    });
    return squareDiffs.reduce(function (a, b) { return a + b }, 0);
};

function getLinearDistance(city1, city2) {
    location1 = city1.location;
    location2 = city2.location;
    return distanceInKmBetweenEarthCoordinates(location1[0], location1[1], location2[0], location2[1]);
}

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function distanceInKmBetweenEarthCoordinates(lat1, lon1, lat2, lon2) {
    var earthRadiusKm = 6371;

    var dLat = degreesToRadians(lat2 - lat1);
    var dLon = degreesToRadians(lon2 - lon1);

    lat1 = degreesToRadians(lat1);
    lat2 = degreesToRadians(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadiusKm * c;
}