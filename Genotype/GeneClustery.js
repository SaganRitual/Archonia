/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Proxy */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {
  
var geneClustery = {
  
  getCluster: function(genome, whichCluster) {
    console.log("gtCluster", "cluster_" + whichCluster);
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
    if(!(name in target)) { Archonia.Axioms.hurl(new Error("No such gene '" + name + "'")); }
  },

  // Archon gets to see everything
  cluster_archon: function(genome, gene) { 
    console.log("archon", gene);
    return geneClustery.getGene(genome, gene); },
  
  cluster_legs: function(genome, gene) {
    var valid = [ "maxMAcceleration", "maxMVelocity" ];
    
    if(gene in valid) { return geneClustery.getGene(genome, gene); }
    else { throw Error("Component 'legs' has no access to gene '" + gene + "'"); }
  }
};

Archonia.Cosmos.GeneClustery = geneClustery;
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.GeneClustery;
}
