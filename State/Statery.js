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
  archonUniqueId: null,
  beingPoisoned: null,
  encysted: null,
  frameCount: null,
  hungerInput: null,
  position: null,
  sensedArchons: null,
  sensedSkinnyManna: null,
  targetPosition: new Archonia.Form.TargetPositionStatene(),
  tempInput: null,
  velocity: null,
  where: Archonia.Form.XY()
};

var selectStatome = function(archonOrStatomeId) {
  if(archonOrStatomeId === undefined) { return primordialStatome; }
  else if(archonOrStatomeId instanceof Archonia.Form.Archon) { return statomePool[archonOrStatomeId.statomeId]; }
  else { return statomePool[archonOrStatomeId]; }
};

Archonia.Cosmos.Statery = {
  
  statifyMe: function(archon) {
    var newStatome = { };

    for(var i in primordialStatome) { newStatome[i] = primordialStatome[i]; }
    
    // This statome and this archon will forever be linked, both
    // to be reset and re-launched with each precious cycle of life
    archon.statomeId = statomePool.length;
    statomePool.push(newStatome);
    archon.state = Archonia.Cosmos.StateClustery.makeStateneCluster(newStatome, "archon");
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
