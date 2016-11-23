/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {

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

  // dummy entries, all relating to color; getters take care of these 
  hslString: null,
  optimalTemp: null,
  optimalTempHi: null,
  optimalTempLo: null,
  tempRange: null,
  tempRadius: null,
  
  toxinStrength:               new Archonia.Form.ScalarGene(1),
  toxinResistance:             new Archonia.Form.ScalarGene(1),
  reproductionThreshold:       new Archonia.Form.ScalarGene(500),
  embryoThreshold:             new Archonia.Form.ScalarGene(200),

  tempThresholdEncyst:         new Archonia.Form.ScalarGene(0.85),
  tempThresholdUnencyst:       new Archonia.Form.ScalarGene(0.50),
  tempThresholdVerticalOnly:   new Archonia.Form.ScalarGene(0.80),
  tempThresholdHorizontalOk:   new Archonia.Form.ScalarGene(0.75),

  tempToleranceMultiplier:     new Archonia.Form.ScalarGene(1),
  pollenToleranceMultiplier:   new Archonia.Form.ScalarGene(1),
  hungerToleranceMultiplier:   new Archonia.Form.ScalarGene(1),
};

var Genome = function(genomeCore) {
  this.genomeCore = genomeCore;
};

var colorGeneNames = [
  "hslString", "optimalTemp", "optimalTempHi", "optimalTempLo", "tempRange", "tempRadius"
];

var TheGenomery = function() {
  Object.defineProperty(Genome.prototype, "hslString", {
    get: function() { return this.genomeCore.color.getHslString(); }
  });

  Object.defineProperty(Genome.prototype, "optimalTemp", {
    get: function() { return this.genomeCore.color.getOptimalTemp(); }
  });

  Object.defineProperty(Genome.prototype, "optimalTempHi", {
    get: function() { return this.genomeCore.color.getOptimalTempHi(); }
  });

  Object.defineProperty(Genome.prototype, "optimalTempLo", {
    get: function() { return this.genomeCore.color.getOptimalTempLo(); }
  });

  Object.defineProperty(Genome.prototype, "tempRange", {
    get: function() { return this.genomeCore.color.getTempRange(); }
  });

  Object.defineProperty(Genome.prototype, "tempRadius", {
    get: function() { return this.genomeCore.color.getTempRadius(); }
  });

  for(var geneName in primordialGenome) {
    if(colorGeneNames.indexOf(geneName) === -1) {
      (function(geneName) {
        Object.defineProperty(Genome.prototype, geneName, {
          get: function() {
            return this.genomeCore[geneName].value; }
        });
      })(geneName);
    }
  }
};

TheGenomery.prototype = {
  
  genomifyMe: function(archon) {
    var genomeCore = { };

    for(var geneName in primordialGenome) {
      if(primordialGenome[geneName] === null) { genomeCore[geneName] = null; }
      else { genomeCore[geneName] = primordialGenome[geneName].newGene(); }
    }
    
    archon.genome = new Genome(genomeCore);
  },
  
  inherit: function(childArchon, parentArchon) {
    // We already used the primordial to generate the genome for
    // the child archon. Now, if no parent archon is specified,
    // meaning this is a miraculous birth at creation, we're
    // inheriting from the primordial -- but we're not doing anything 
    // weird, and it doesn't waste anything; we're not creating new
    // genes, we're just updating the existing ones, using the
    // primordial as our starting point
    var parentGenome = parentArchon === undefined ? primordialGenome : parentArchon.genome.genomeCore;
    var childGenome = childArchon.genome.genomeCore;

    for(var i in parentGenome) {
      if(parentGenome[i] !== null) {
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

Archonia.Cosmos.TheGenomery = { start: function() { Archonia.Cosmos.TheGenomery = new TheGenomery(); } };

})(Archonia);
