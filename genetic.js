function City(name, location) {
    this.name = name;
    this.location = location;
}

function Population (initialData = [], startCity) {
    var self = this;
    this.initialData = initialData;
    this.startCity = new City(startCity.cityName, startCity.coordinates);
    this.count = 20;
    this.cityCount = initialData.length;
    this.paths = [];
    this.cities = [];
    this.distances = [];
    this.fitness = [];
    this.bestPath = 0;
    this.useElitism = true;
    this.mutationRate = 0.05;
    this.crossSize = 2;
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

    this.initCities = function() {
        var i = 0;
        this.initialData.forEach(element => {
            this.cities[i] = new City(element.name, element.location);
            i++;
        });
    };

    this.initPaths = function () {
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
        for(var i=0;i<this.count;i++){
            var sum = 0;
            for(j=0;j<this.cityCount-1;j++){
                //sum += sumOfSquareDiffs(this.cities[this.paths[i][j]].location, this.cities[this.paths[i][j + 1]].location);
                sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.cities[this.paths[i][j]].name, this.cities[this.paths[i][j + 1]].name);
            }
              //sum += sumOfSquareDiffs(this.startCity.location, this.cities[0].location);
              sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.startCity.name, this.cities[0].name);
              //sum += sumOfSquareDiffs(this.cities[this.cities.length- 1].location, this.startCity.location);
              sum += this.cityDistanceMatrixRepository.getDistanceByStartEndCity(this.cities[this.cities.length- 1].name, this.startCity.name);

            this.distances[i] = sum;
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

        var parentA, parentB;
        var childA = [], childB = [];

        parentA = this.findBest();
        parentB = this.findBest([parentA]);


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

        //replace new childrens with worst 2
        //find worst
        var worstPathA = this.findWorst();
        var worstPathB = this.findWorst([worstPathA]);

        //replace with
        this.paths[worstPathA] = childA;
        this.paths[worstPathB] = childB;
    }

    this.mutation = function () {
        //applying swap mutation

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

                swap(this.paths[pathindex], cityindexA, cityindexB);
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
    var squareDiffs = oneVector.map(function(component, i) {
      return Math.pow(component - anotherVector[i], 2);
    });
    return squareDiffs.reduce(function(a, b) { return a + b }, 0);
  };