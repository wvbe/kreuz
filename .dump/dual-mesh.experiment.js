const MeshBuilder = require('dual-mesh/create');
let Poisson = require('poisson-disk-sampling');
let mesh = new MeshBuilder({ boundarySpacing: 75 }).addPoisson(Poisson, 75).create();
console.dir(mesh);
