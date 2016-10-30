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
  
var geneClustery = {
  
  getCluster: function(genome, whichCluster) {
    return new Proxy(genome, geneClustery["cluster_" + whichCluster]);
  },
  
  getGene: function(genome, whichGene) {
    geneClustery.throwIfNotPresent(genome, whichGene);
    
    switch(whichGene) {
      case "color":         return genome.color.getColorAsDecimal();
      case "optimalTempHi": return genome.color.getOptimalTempHi();
      case "optimalTempLo": return genome.color.getOptimalTempLo();
      case "optimalTemp":   return genome.color.getOptimalTemp();
      case "tempRange":     return genome.color.getTempRange();
      case "tempRadius":    return genome.color.getTempRadius();
      
      default: return genome[whichGene].value;
    }
  },
  
  throwIfNotPresent: function(target, name) {
    if(!(name in target)) { Archonia.Essence.hurl(new Error("No such gene '" + name + "'")); }
  },

  // Archon gets to see everything
  cluster_archon: {
    get: function(genome, gene) { 
      return geneClustery.getGene(genome, gene);
    }
  },
  
  cluster_legs: {
    get:  function(genome, gene) {
      var valid = [ "maxMAcceleration", "maxMVelocity" ];

      if(valid.indexOf(gene) === -1) { throw Error("Component 'legs' has no access to gene '" + gene + "'"); }
      else { return geneClustery.getGene(genome, gene); }
    }
  }
};

Archonia.Cosmos.GeneClustery = geneClustery;
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.GeneClustery;
}
