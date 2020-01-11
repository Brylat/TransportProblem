const clusterMaker = clusters;

//number of clusters, defaults to undefined
clusterMaker.k(5);

//number of iterations (higher number gives more time to converge), defaults to 1000
clusterMaker.iterations(750);

clusterMaker.capacity(5);

//data from which to identify clusters, defaults to []
clusterMaker.data([
        { coordinates: [1.12, 0.54], capacity: 2},
        { coordinates: [0.89, 1.34], capacity: 2},
        { coordinates: [0.1234, 0.3241], capacity: 2},
        { coordinates: [-10.3423, 10.99], capacity: 2},
        { coordinates: [-9.346, 11.2434], capacity: 2},
        { coordinates: [10, 10], capacity: 2},
        { coordinates: [11, 12], capacity: 2}
    ]);

console.log(clusterMaker.clusters());