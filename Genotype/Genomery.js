/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

if(typeof window === "undefined") {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Essence = require('../Essence.js');
  
  var genes = require('./Gene.js');
  Archonia.Form.Gene = genes.Gene;
  Archonia.Form.ScalarGene = genes.ScalarGene;
  Archonia.Form.ColorGene = genes.ColorGene;
  
  Archonia.Cosmos.GeneClustery = require('./GeneClustery.js');
  tinycolor = require('../TinyColor/tinycolor.js');
}

(function(Archonia) {
  
var genomePool = [];

var primordialGenome = {
  color:                     new Archonia.Form.ColorGene(tinycolor('hsl(180, 100%, 50%)')),

  maxMAcceleration:          new Archonia.Form.ScalarGene(15),
  maxMVelocity:              new Archonia.Form.ScalarGene(30),
  sensorScale:               new Archonia.Form.ScalarGene(Archonia.Axioms.standardSensorScale),
  
  birthMassAdultCalories:      new Archonia.Form.ScalarGene(100),
  birthMassLarvalCalories:     new Archonia.Form.ScalarGene(100),
  offspringMassLarvalCalories: new Archonia.Form.ScalarGene(100),
  offspringMassAdultCalories:  new Archonia.Form.ScalarGene(100),
  predationRatio:              new Archonia.Form.ScalarGene(1.5),
  predatorFearRatio:           new Archonia.Form.ScalarGene(1.5),

  // dummy entries so the getters will work
  optimalTemp: null,
  optimalTempHi: null,
  optimalTempLo: null,
  tempRange: null,
  tempRadius: null,
  
  toxinStrength:               new Archonia.Form.ScalarGene(1),
  toxinResistance:             new Archonia.Form.ScalarGene(1),
  reproductionThreshold:       new Archonia.Form.ScalarGene(500),
  embryoThreshold:             new Archonia.Form.ScalarGene(200),

  tempToleranceMultiplier:     new Archonia.Form.ScalarGene(1),
  tempThresholdEncyst:         new Archonia.Form.ScalarGene(0.85),
  tempThresholdUnencyst:       new Archonia.Form.ScalarGene(0.50),
  tempThresholdVerticalOnly:   new Archonia.Form.ScalarGene(0.80),
  tempThresholdHorizontalOk:   new Archonia.Form.ScalarGene(0.75),
  tempSignalBufferSize:        new Archonia.Form.ScalarGene(10),
  tempSignalDecayRate:         new Archonia.Form.ScalarGene(0.03),

  hungerToleranceMultiplier:   new Archonia.Form.ScalarGene(0.75),
  hungerSignalBufferSize:      new Archonia.Form.ScalarGene(10),
  hungerSignalDecayRate:       new Archonia.Form.ScalarGene(0.03)
};

var getGenome = function(archon) {
  if(archon === undefined) { return primordialGenome; }
  else { return genomePool.find(function(g) { return g.archonUniqueId === archon.archonUniqueId; }); }
};

Archonia.Cosmos.Genomery = {
  
  genomifyMe: function(archon) {
    var newGenome = { archonUniqueId: archon.archonUniqueId };

    for(var i in primordialGenome) {
      if(primordialGenome[i] === null) { newGenome[i] = null; }
      else { newGenome[i] = primordialGenome[i].newGene(); }
    }
    
    genomePool.push(newGenome);
    archon.genome = Archonia.Cosmos.GeneClustery.getCluster(newGenome, "archon");
  },
  
  getCluster: function(archon, clusterName) {
    var genome = getGenome(archon);
    return Archonia.Cosmos.GeneClustery.getCluster(genome, clusterName);
  },
  
  inherit: function(childArchon, parentArchon) {
    // We already used the primordial to generate the genome for
    // the child archon. Now, if no parent archon is specified,
    // meaning this is a miraculous birth at creation, we're
    // inheriting from the primordial -- but we're not doing anything 
    // weird, and it doesn't waste anything; we're not creating new
    // genes, we're just updating the existing ones, using the
    // primordial as our starting point
    var parentGenome = getGenome(parentArchon);
    var childGenome = getGenome(childArchon);

    for(var i in parentGenome) {
      if(parentGenome[i] === null) { childGenome[i] = null; }
      
      else {
        try { childGenome[i].inherit(parentGenome[i]); }
        catch(e) {
          if(e.message === "Scalar gene value < 0") {
            Archonia.Essence.hurl(new Archonia.Essence.BirthDefect(
              "Scalar gene '" + i + "' value = " + childGenome[i].value.toFixed(4)
            ));
          } else {
            Archonia.Essence.hurl(e);
          }
        }
      }
    }
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Genomery;
}
