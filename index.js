const clusterMaker = clusters;

//number of clusters, defaults to undefined
clusterMaker.k(3);

//number of iterations (higher number gives more time to converge), defaults to 1000
clusterMaker.iterations(750);

//data from which to identify clusters, defaults to []
clusterMaker.data([[1, 0], [0, 1], [0, 0], [-10, 10], [-9, 11], [10, 10], [11, 12]]);

console.log(clusterMaker.clusters());