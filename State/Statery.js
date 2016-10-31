/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Cosmos.StateClustery = require("./StateClustery.js");
  Archonia.Form.Archon = require("../Phenotype/Archon.js");
}

(function(Archonia) {
  
var statomePool = [];

var primordialStatome = {
  beingPoisoned: false,
  position: null,
  velocity: null
};

var selectStatome = function(archonOrStatomeId) {
  if(archonOrStatomeId === undefined) { return primordialStatome; }
  else if(archonOrStatomeId instanceof Archonia.Form.Archon) { return statomePool[archonOrStatomeId.statomeId]; }
  else { return statomePool[archonOrStatomeId]; }
};

Archonia.Cosmos.Statery = {
  
  statomifyMe: function(archon) {
    var newStatome = { };

    for(var i in primordialStatome) { newStatome[i] = primordialStatome[i]; }
    
    // This statome and this archon will forever be linked, both
    // to be reset and re-launched with each precious cycle of life
    archon.statomeId = statomePool.length;
    statomePool.push(newStatome);
    archon.statome = Archonia.Cosmos.StateClustery.makeStateneCluster(newStatome, "archon");
  },
  
  makeStateneCluster: function(archonOrStatomeId, clusterName) {
    var statome = selectStatome(archonOrStatomeId);
    return Archonia.Cosmos.StateClustery.makeStateneCluster(statome, clusterName);
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Statery;
}
