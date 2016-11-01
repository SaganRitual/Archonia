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
  
  makeGeneCluster: function(genome, whichCluster) {
    var handlerName = "cluster_" + whichCluster;
    
    if(!(handlerName in geneClustery)) { Archonia.Essence.hurl(new Error("No gene cluster for '" + whichCluster + "'")); }

    return new Proxy(genome, geneClustery[handlerName]);
  },
  
  getGene: function(component, genome, whichGene) {
    geneClustery.throwIfNotPresent(genome, whichGene);
    geneClustery.throwIfNotAccessible(component, whichGene);
    
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
  
  throwIfNotAccessible: function(component, gene) {
    if(component !== "archon" && component !== "head") {
      var handlerName = "cluster_" + component;
      var valid = geneClustery[handlerName].valid;
    
      if(valid.indexOf(gene) === -1) { throw Error("Component '" + component + "' has no access to gene '" + gene + "'"); }
    }
  },
  
  throwIfNotPresent: function(target, name) {
    if(!(name in target)) { Archonia.Essence.hurl(new Error("No such gene '" + name + "'")); }
  },

  cluster_archon: { get: function(genome, gene) {  return geneClustery.getGene("archon", genome, gene); } },
  
  cluster_forager: {
    valid: [ "hungerToleranceMultiplier", "tempToleranceMultiplier" ],

    get: function(genome, gene) { return geneClustery.getGene("forager", genome, gene); }
  },
  
  cluster_goo: {
  
    valid: [
      "birthMassLarvalCalories", "birthMassAdultCalories",
      "embryoThreshold", "hungerToleranceFactor", "maxMAcceleration", "maxMVelocity",
      "offspringMassAdultCalories", "offspringMassLarvalCalories",
      "optimalTemp", "optimalTempHi", "optimalTempLo",
      "reproductionThreshold", "sensorScale", "tempRange", "toxinResistance", "toxinStrength"
    ],

    get: function(genome, gene) { return geneClustery.getGene("goo", genome, gene); }
  },
  
  cluster_head: { get: function(genome, gene) {  return geneClustery.getGene("head", genome, gene); } },
  
  cluster_legs: {
    valid: [ "maxMAcceleration", "maxMVelocity" ],
    get: function(genome, gene) { return geneClustery.getGene("legs", genome, gene); }
  },
  
  cluster_senses: {
    valid: [
      "birthMassAdultCalories", "hungerSignalBufferSize", "hungerSignalDecayRate", "optimalTemp", "optimalTempHi",
      "optimalTempLo", "reproductionThreshold", "tempRadius", "tempSignalBufferSize", "tempSignalDecayRate"
    ],
    
    get: function(genome, gene) { return geneClustery.getGene("senses", genome, gene); }
  }
};

Archonia.Cosmos.GeneClustery = geneClustery;
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.GeneClustery;
}
