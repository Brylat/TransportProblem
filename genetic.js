/*
* Kush Kumar Sharma
* Apache License | Version 2.0, January 2004 | http://www.apache.org/licenses/
*/

var DEBUG = false;

var cities = [];
var totalCities = 15; //fact(25): 15511210043330985984000000 (~10^24)

var recordDistance;
var bestEver;

var percent = 0;
var iteration = 0;
var totalIterations = 0;

var pop;
var populationCount = 10;

//tested this model for values -
//cities : 15
//pop : 20
//elitism : true | if enabled, no mutation for bestpath
//mutation rate : 0.05
//mutation type : swap
//crossover window size : 2 | takes parent as 2 bestpaths, produces 2 children, replaces 2 worstpaths
//fitness : 1/distance between cities

//gap to draw two simulation
var screenOffset;

function setup() {


  createPopulation();


  cities = pop.cities.slice();

  var d = calcDistance(cities);
  recordDistance = d;
  bestEver = cities.slice();

  totalIterations = fact(totalCities)

}

function createPopulation() {
    pop = new Population();
    pop.init();
}

function City(name, location) {
    this.name = name;
    this.location = location;
}


function Population (initialData = [], startCity) {
    var self = this;
    this.initialData = initialData; //obj with name and localization
    this.count = populationCount;
    this.cityCount = initialData.length;
    this.paths = []; // paths used for simulation between cities. Stores index of serial traversal of city
    this.cities = []; // cities used in this simulation. Has screen position of each city
    this.distances = []; //distances of routes. Sum of each city using respective path
    this.fitness = [];
    this.bestPath = 0; //index of best path
    this.useElitism = true;
    this.mutationRate = 0.05;
    this.crossSize = 2; //floor(max(1, this.cityCount/3)); //take the crossover window of size = max(1, total cities/3);
    this.bestDistanceEver = 999999999999999;

    this.init = () => {
        console.log("init");
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

    this.initCities = function() {
        var i = 0;
        this.initialData.forEach(element => {
            this.cities[i] = new City(element.name, element.location);
            i++;
        });
    };

    this.initPaths = function () {
        //generate random path indexes
        var path = [];
        for(var j=0;j < this.cityCount;j++){
            path.push(j);
        }
        for (var i = 0; i < this.count; i++) {
            shuffle(path);
            this.paths.push(path.slice());
        }
    };

    this.updateDistance = function () {
        //sum of route distance
        for(var i=0;i<this.count;i++){
            var sum = 0;
            for(j=0;j<this.cityCount-1;j++){
                sum += sumOfSquareDiffs(this.cities[this.paths[i][j]].location, this.cities[this.paths[i][j + 1]].location);
            }
            //ADD FROM START CITY A TO START CITY DISTANCE #AJ
             
            ///

            this.distances[i] = sum;
            //console.log("d:"+sum);
            //updating best available route uptil now
            if(sum < this.distances[this.bestPath]){
                this.bestPath = i;
            }

            if(sum < this.bestDistanceEver)
                this.bestDistanceEver = sum;
        }
    }

    this.updateFitness = function () {
        for(i=0;i<this.count;i++){
            this.fitness[i] = 1 / this.distances[i];
        }
    }

    this.crossover = function () {
        //pick 2 of the better (shorter) tours parents in the population and combine them to make 2 new child tours.
        //Hopefully, these children tour will be better than either parent

        if(DEBUG)
            console.log("Applying Crossover... ");
        //find best 2 path as parents
        var parentA, parentB;
        var childA = [], childB = [];

        parentA = this.findBest();
        parentB = this.findBest([parentA]);
        //console.log(parentA+" , "+ parentB);

        /*
        //get parent A
        var maxP = 0;
        for(i = 1;i<this.count;i++){
            if(this.distances[i] < this.distances[maxP])
                maxP = i;
        }
        parentA = maxP;
        //console.log(parentA);

        //get parent B
        maxP = (parentA == 0) ? 1 : 0;
        for(i = 0;i<this.count;i++){
            if(i != parentA && this.distances[i] < this.distances[maxP])
                maxP = i;
        }
        parentB = maxP;
        //console.log(parentB);
        */

        childA = Array(this.cityCount).fill(-1);
        childB = Array(this.cityCount).fill(-1);

        //create offsprings

        //console.log("win:"+crossSize);
        var crossPos = Math.floor(Math.random(this.cityCount - this.crossSize));
        //console.log("pos:"+crossPos);

        //child A
        for(var i=0;i<this.cityCount;i++){
            if(i >= crossPos && i <= crossPos+this.crossSize){
                //if we are in crossover window area then copy as it is from parent A
                childA[i] = this.paths[parentA][i];
            }
        }
        for(var i=0, j = 0; i<this.cityCount; i++){
            //copy from parent B if not already added from parent A

            //look for empty spot in child
            while(childA[j] != -1 && j<this.cityCount) j++;

            if(childA.indexOf(this.paths[parentB][i]) == -1){
                childA[j++] = this.paths[parentB][i];
            }
        }

        crossPos = Math.floor(Math.random(this.cityCount - this.crossSize));

        //now child B, switch parents
        for(var i=0; i<this.cityCount; i++){
            if(i >= crossPos && i <= crossPos+this.crossSize){
                //if we are in crossover window area then copy as it is from parent B
                childB[i] = this.paths[parentB][i];
            }
        }
        for(var i=0, j = 0; i<this.cityCount; i++){
            //copy from parent A if not already added from parent B

            //look for empty spot in child
            while(childB[j] != -1 && j<this.cityCount) j++;

            if(childB.indexOf(this.paths[parentA][i]) == -1){
                childB[j++] = this.paths[parentA][i];
            }
        }

        if(DEBUG)
        console.log("Updating population with new childrens");
        //replace new childrens with worst 2
        //find worst
        var worstPathA = this.findWorst();
        var worstPathB = this.findWorst([worstPathA]);

        //replace with
        this.paths[worstPathA] = childA;
        this.paths[worstPathB] = childB;

        if(DEBUG){
            console.log("parents:" + this.paths[parentA] + " || "+this.paths[parentB]);
            console.log("child A:"+childA);
            console.log("child B:"+childB);
        }
    }

    this.mutation = function () {
        //applying swap mutation
        if(DEBUG)
            console.log("Applying mutation with rate:"+this.mutationRate);

        if(this.mutationRate < Math.random()){
            var pathindex;// = Math.floor(random(this.count));

            var currentBestPath = this.findBest();

            for(pathindex = 0;pathindex<this.count;pathindex++){

                if(this.useElitism === true && currentBestPath == pathindex)
                {
                    //dont apply mutation to best fitness path if elitism on
                    continue;
                }
                var cityindexA = Math.floor(Math.random(this.cityCount));
                var cityindexB = Math.floor(Math.random(this.cityCount));

                //if(DEBUG)
                //    console.log("Mutated path: "+this.paths[pathindex]);

                swap(this.paths[pathindex], cityindexA, cityindexB);

                //if(DEBUG)
                //    console.log("to path: "+this.paths[pathindex]);
            }
        }
    }

    //find path with best fitness, ignoring paths provided in argument
    this.findBest = function (ignoreList) {
        var best = 0;
        ignoreList = ignoreList || [];

        for(i = 0;i<this.count;i++){
            var ignore = false;
            for(j=0;j<ignoreList.length;j++){
                if(i == ignoreList[j])
                {
                    ignore = true;
                }

                if(best == ignoreList[i]){
                    best++;
                }
            }

            if(ignore === true){
                continue;
            }

            if(this.fitness[i] > this.fitness[best])
                best = i;

        }

        return best;
    }

    //find path with lowest fitness, ignoring paths provided in argument
    this.findWorst = function (ignoreList) {
        var worst = 0;
        ignoreList = ignoreList || [];

        for(i = 0;i<this.count;i++){
            var ignore = false;
            for(j=0;j<ignoreList.length;j++){
                if(i == ignoreList[j])
                {
                    ignore = true;
                }

                if(worst == ignoreList[i]){
                    worst++;
                }
            }

            if(ignore === true){
                continue;
            }

            if(this.fitness[i] < this.fitness[worst])
                worst = i;

        }

        return worst;
    }
}

function draw() {
  randomTSP();

  gaTSP();



  iteration++;
  percent = iteration/totalIterations * 100;
  //console.log("%:"+ percent + " ti:"+totalIterations+" i:"+iteration)
  //if(percent > 99.99)
  //    noLoop();

  text(iteration, 20, height - 20)

}

function gaTSP() {

    //background(0);

    //drawing cities
    fill(255);
    noStroke();
    for (var i = 0; i < cities.length; i++) {
      ellipse(screenOffset + cities[i].x, cities[i].y, 12, 12);
    }

    stroke(255);
    strokeWeight(2);
    noFill();
    //drawing current second best
    beginShape();
    for (var i = 0; i < pop.cityCount; i++) {
        var secondBest = pop.findBest([pop.bestPath]);
        vertex(screenOffset + pop.cities[pop.paths[secondBest][i]].x, pop.cities[pop.paths[secondBest][i]].y);
    }
    endShape();

    //draw current best path
    stroke(155, 10, 255);
    strokeWeight(4);
    noFill();
    beginShape();
    for (var i = 0; i < pop.cityCount; i++) {
        vertex(screenOffset + pop.cities[pop.paths[pop.bestPath][i]].x, pop.cities[pop.paths[pop.bestPath][i]].y);
    }
    endShape();


    textSize(16);
    fill(255);

    pop.evolve();

    //display best path distance
    text(pop.distances[pop.bestPath], width - 200, height - 20);

    //if elitism is off, draw best ever distance found so far in simulation
    if(pop.useElitism === false){
        text(pop.bestDistanceEver, width - 200, 20);
    }
}

function randomTSP() {
    //clear screen
    background(0);

    //drawing cities
    fill(255);
    noStroke();
    for (var i = 0; i < cities.length; i++) {
      ellipse(cities[i].x, cities[i].y, 12, 12);
    }

    //draw current processing path
    stroke(255);
    strokeWeight(2);
    noFill();
    beginShape();
    for (var i = 0; i < cities.length; i++) {
      vertex(cities[i].x, cities[i].y);
    }
    endShape();


    //draw best path ever
    stroke(155, 10, 255);
    strokeWeight(4);
    noFill();
    beginShape();
    for (var i = 0; i < cities.length; i++) {
      vertex(bestEver[i].x, bestEver[i].y);
    }
    endShape();

    //applying random swaps
    var i = floor(random(cities.length));
    var j = floor(random(cities.length));
    swap(cities, i, j);

    //is this better than before?
    var d = calcDistance(cities);
    if (d < recordDistance) {
      recordDistance = d;
      bestEver = cities.slice();
    }

    fill(255);
    text(recordDistance, width/2 - 200, height - 20)
}

function swap(a, i, j) {
  var temp = a[i];
  a[i] = a[j];
  a[j] = temp;
}


function calcDistance(points) {
  var sum = 0;
  for (var i = 0; i < points.length - 1; i++) {
    var d = dist(points[i].x, points[i].y, points[i + 1].x, points[i + 1].y);
    sum += d;
  }
  return sum;
}

function fact(i) {
    var res = i;
    while(i>1){
        res *= i-1;
        i--;
    }
    return res;
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
    var squareDiffs = oneVector.map(function(component, i) {
      return Math.pow(component - anotherVector[i], 2);
    });
    return squareDiffs.reduce(function(a, b) { return a + b }, 0);
  };