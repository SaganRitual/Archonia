/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Proxy */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

if(typeof window === "undefined") {
  var genes = require('./Gene.js');
  Archonia.Form.Gene = genes.Gene;
  Archonia.Form.ScalarGene = genes.ScalarGene;
  Archonia.Form.ColorGene = genes.ColorGene;
  
  Archonia.Cosmos.GeneClustery = require('./GeneClustery.js');
  tinycolor = require('../TinyColor/tinycolor.js');
}

(function(Archonia) {

Archonia.Form.Genome = function(archon, parentGenome) {
  this.archon = archon;
  
  for(var i in parentGenome) {
    if(parentGenome[i] instanceof Archonia.Form.Gene) {
      if(parentGenome[i] === null) { this[i] = null; }
      else { this[i] = parentGenome[i].newGene(); }
    }
  }
};

Archonia.Form.Genome.prototype = {
  getCluster: function(which) { return Archonia.Form.GeneClustery.getCluster(this, which); },
  
  inherit: function(parentGenome) {
    for(var i in parentGenome) { 
      if(parentGenome[i] === null) { this[i] = null; }
      else if(parentGenome[i] instanceof Archonia.Form.Gene) {
        try { this[i].inherit(parentGenome[i]); }
        catch(e) {
          if(e.message === "Scalar gene value < 0") {
            Archonia.Axioms.hurl(new Archonia.Essence.BirthDefect(
              "Scalar gene '" + i + "' value = " + this[i].value.toFixed(4)
            ));
          } else {
            throw Archonia.Axioms.hurl(e);
          }
        }
      }
    }
  }
};

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

Archonia.Cosmos.Genomery = {
  
  genomifyMe: function(archon) {
    var g = new Archonia.Form.Genome(archon, primordialGenome);
    archon.genome = Archonia.Cosmos.GeneClustery.getCluster(g, "archon");
    
    archon.foo = new Proxy({}, function() {
      return "barf";
    });
  },
  
  inherit: function(childArchon, parentArchon) {
    // We already used the primordial to generate the genome for
    // the child archon. Now, if no parent archon is specified,
    // meaning this is a miraculous birth at creation, we're
    // inheriting from the primordial -- but we're not doing anything 
    // weird, and it doesn't waste anything; we're not creating new
    // genes, we're just updating the existing ones, using the
    // primordial as our starting point
    if(parentArchon === undefined) { parentArchon = { genome: primordialGenome }; }
    childArchon.genome.inherit(parentArchon.genome);
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Genomery;
}
