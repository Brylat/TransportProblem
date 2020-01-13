const clusterMaker = clusters;
const kMeansVisualisationMaker = kMeansVisualisation;
const cityDistanceMatrixRepository = cityDistanceMatrix;
const cityDistanceRetrieverClient = cityDistanceClient;

//number of clusters, defaults to undefined
clusterMaker.k(5);

//number of iterations (higher number gives more time to converge), defaults to 1000
clusterMaker.iterations(750);

clusterMaker.capacity(1000);

//data from which to identify clusters, defaults to []
var pointsArray = [
        { coordinates: [53.131934, 23.168368], cityName:"Bialystok", capacity: 500},
        { coordinates: [49.821319, 19.057035], cityName:"Bielsko-Biala", capacity: 50},
        { coordinates: [50.134341, 19.400587], cityName:"Chrzanow", capacity: 400},
        { coordinates: [54.351604, 18.646489], cityName:"Gdansk", capacity: 200},
        { coordinates: [54.519040, 18.530561], cityName:"Gdynia", capacity: 100},
        { coordinates: [50.294392, 18.671416], cityName:"Gliwice", capacity: 40},
        { coordinates: [49.838122, 20.961405], cityName:"Gromnik", capacity: 200},
        { coordinates: [50.264166, 19.023621], cityName:"Katowice", capacity: 300},
        { coordinates: [50.865934, 20.628467], cityName:"Kielce", capacity: 30},
        { coordinates: [49.682352, 21.766189], cityName:"Krosno", capacity: 60},
        { coordinates: [49.421609, 20.959488], cityName:"Krynica", capacity: 50},
        { coordinates: [51.246404, 22.567833], cityName:"Lublin", capacity: 60},
        { coordinates: [51.759056, 19.455241], cityName:"Lodz", capacity: 160},
        { coordinates: [54.036081, 19.037702], cityName:"Malbork", capacity: 100},
        { coordinates: [49.477466, 20.032289], cityName:"Nowy Targ", capacity: 120},
        { coordinates: [53.778387, 20.480172], cityName:"Olsztyn", capacity: 300},
        { coordinates: [52.406116, 16.925373], cityName:"Poznan", capacity: 100},
        { coordinates: [51.416300, 21.969277], cityName:"Pulawy", capacity: 200},
        { coordinates: [51.402494, 21.147125], cityName:"Radom", capacity: 100},
        { coordinates: [50.040811, 21.999025], cityName:"Rzeszow", capacity: 60},
        { coordinates: [50.682046, 21.750132], cityName:"Sandomierz", capacity: 200},
        { coordinates: [53.428519, 14.552567], cityName:"Szczecin", capacity: 150},
        { coordinates: [50.309123, 21.074738], cityName:"Szczucin", capacity: 60},
        { coordinates: [50.827379, 15.525944], cityName:"Szklarska Poreba", capacity: 50},
        { coordinates: [50.011997, 20.985770], cityName:"Tarnow", capacity: 70},
        { coordinates: [52.229810, 21.012032], cityName:"Warszawa", capacity: 200},
        { coordinates: [49.987128, 20.064386], cityName:"Wieliczka", capacity: 90},
        { coordinates: [51.107750, 17.038510], cityName:"Wroclaw", capacity: 40},
        { coordinates: [49.299081, 19.949262], cityName:"Zakopane", capacity: 200},
        { coordinates: [50.723119, 23.251935], cityName:"Zamosc", capacity: 300} 
    ];
	

clusterMaker.data(pointsArray);
var calculatedClusters = clusterMaker.clusters();

//draw clusters on map.
kMeansVisualisationMaker.init();
calculatedClusters.map(clusters => kMeansVisualisationMaker.buildClusters(clusters.points.map(p => p.location)));
kMeansVisualisationMaker.drawClustersVisualisation();

//cityDistanceRetrieverClient.download(pointsArray); do not enable, will retrieve 30x30 cityDistanceMatrix from external api (870 requests).

//city distane matrix repository for easy retrieving route distance instead of geographical distance.
cityDistanceMatrixRepository.init();
console.log("Dystans wieliczka -> nowy targ " + cityDistanceMatrixRepository.getDistanceByStartEndCity("Wieliczka", "Nowy Targ"));
