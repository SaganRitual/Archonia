/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Proxy */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

if(typeof window === "undefined") {
  Archonia.Essence = require("../Essence.js");
}

(function(Archonia) {
  
var stateClustery = {
  
  makeStateneCluster: function(statome, whichCluster) {
    return new Proxy(statome, stateClustery["cluster_" + whichCluster]);
  },
  
  getStatene: function(statome, whichStatene) {
    stateClustery.throwIfNotPresent(statome, whichStatene);
    return statome[whichStatene];
  },
  
  throwIfNotPresent: function(target, name) {
    if(!(name in target)) { Archonia.Essence.hurl(new Error("No such statene '" + name + "'")); }
  },

  // Archon gets to see everything
  cluster_archon: {
    get: function(statome, statene) {  return stateClustery.getStatene(statome, statene); },
    set: function(statome, statene, v) { stateClustery.setStatene(statome, statene, v); }
  },
  
  cluster_goo: {
    valid: [ "beingPoisoned" ],
    
    get: function(statome, statene) {
      stateClustery.throwIfNotPresent(statome, statene);
      
      if(stateClustery.cluster_goo.valid.indexOf(statene) === -1) {
        throw Error("Component 'goo' has no access to statene '" + statene + "'");
      } else { return statome[statene]; }
    },
    
    set: function(statome, statene, v) {
      stateClustery.throwIfNotPresent(statome, statene);
      
      if(stateClustery.cluster_goo.valid.indexOf(statene) === -1) {
        throw Error("Component 'goo' has no access to statene '" + statene + "'");
      } else { statome[statene] = v; }
    }
  }
};

Archonia.Cosmos.StateClustery = stateClustery;
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.StateClustery;
}
