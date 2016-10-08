/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.tinycolor = require('./widgets/tinycolor.js');
  Archonia.Axioms = require('./Axioms.js');
}

(function(Archonia) {
  
Archonia.Form.Gene = function() {
  // Archonia always begins with a 10% chance of a +/- 10% change
  this.changeProbability = 10;
  this.changeRange = 10;
};

Archonia.Form.Gene.prototype = {
  inherit: function() { throw new TypeError("Gene base class doesn't inherit"); },
  
  mutateMutatability: function(parentGene) {
    // Have to assign these first, before the mutation, because the
    // mutation function needs them in place before it can
    // operate properly.
    this.changeProbability = parentGene.changeProbability;
    this.changeRange = parentGene.changeRange;

    var newChangeProbability = this.mutateScalar(parentGene.changeProbability);
    var newChangeRange = this.mutateScalar(parentGene.changeRange);
    
    this.changeProbability = newChangeProbability;
    this.changeRange = newChangeRange;
  },
  
  mutateScalar: function(value, sizeOfDomain) {
    var probability = this.changeProbability;
    var range = this.changeRange;
  
    // Hopefull make creation a bit more interesting
    if(Archonia.Cosmos.momentOfCreation) { probability *= 5; range *= 5; }

    // Just to make it interesting, every once in a while, a big change
    var i = null;
    for(i = 0; i < 3; i++) {
      if(this.mutateYN(probability)) {
        range += 10;
        probability += 10;
      } else {
        break;
      }
    }
    
    if(i === 0) {
      return value; // No mutation on this gene for this baby
    } else {
      if(sizeOfDomain === undefined) {
        return Archonia.Axioms.realInRange(
          value * (1 - range / 100), value * (1 + range / 100)
        );
      } else {
        var r = sizeOfDomain * (1 + range / 100);
      
        return Archonia.Axioms.realInRange(value - r, value + r);
      }
    }
  },
  
  mutateYN: function() { return Archonia.Axioms.integerInRange(1, 100) < this.changeProbability; }
};

Archonia.Form.ScalarGene = function(geneScalarValue) { this.value = geneScalarValue; Archonia.Form.Gene.call(this); };

Archonia.Form.ScalarGene.prototype = Object.create(Archonia.Form.Gene.prototype);
Archonia.Form.ScalarGene.prototype.constructor = Archonia.Form.ScalarGene;
Archonia.Form.ScalarGene.prototype.newGene = function() { return new Archonia.Form.ScalarGene(); };

Archonia.Form.ScalarGene.prototype.inherit = function(parentGene) {
  this.mutateMutatability(parentGene);
  this.value = this.mutateScalar(parentGene.value);
};

Archonia.Form.ColorGene = function(gene) { this.color = Archonia.Form.tinycolor(gene); Archonia.Form.Gene.call(this); };

Archonia.Form.ColorGene.prototype = Object.create(Archonia.Form.Gene.prototype);
Archonia.Form.ColorGene.prototype.constructor = Archonia.Form.ColorGene;
Archonia.Form.ColorGene.prototype.newGene = function() { return new Archonia.Form.ColorGene(); };

Archonia.Form.ColorGene.prototype.inherit = function(parentGene) {
  this.mutateMutatability(parentGene);

  var color = Archonia.Form.tinycolor(parentGene.color);

  var hsl = color.toHsl();
  var h = this.mutateScalar(hsl.h, 90);   // Make the domain sizes artificially small to
  var s = this.mutateScalar(hsl.s, 0.25); // limit the amount of color change between
  var L = this.mutateScalar(hsl.l, 0.25); // generations. I like to see some signs of inheritance
  

  if(h < 0) { h += 360; } h %= 360; // Treat the hue like the wheel it is
  if(s < 0) { s += 1; s *= 100; s %= 100; s /= 100; }
  if(L < 0) { L += 1; L *= 100; L %= 100; L /= 100; }
  
  hsl = 'hsl(' + h + ', ' + (s.toFixed(2) * 100) + '%, ' + (L.toFixed(2) * 100) + '%)';
  this.color = Archonia.Form.tinycolor(hsl);
};

Archonia.Form.ColorGene.prototype.getColorAsDecimal = function() { return parseInt(this.color.toHex(), 16); };
Archonia.Form.ColorGene.prototype.getOptimalHiTemp = function() { return this.getOptimalTemp() + this.archon.tempRange / 2; };
Archonia.Form.ColorGene.prototype.getOptimalLoTemp = function() { return this.getOptimalTemp() - this.archon.tempRange / 2; };

Archonia.Form.ColorGene.prototype.getOptimalTemp = function() {
  var L = this.color.toHsl().l;
  var t = Archonia.Essence.temperatureRange.convertPoint(L, Archonia.Essence.oneToZeroRange);
  return t;
};

Archonia.Form.Genome = function(archon, parentGenome) {
  this.archon = archon;
  
  for(var i in parentGenome) {
    if(parentGenome[i] === null) {
      this[i] = null; // For dummy properties so our getters will work -- I hope!
    } else {
      this[i] = parentGenome[i].newGene();
      this[i].archon = archon;
    }
  }
};

Archonia.Form.Genome.prototype = {
  inherit: function(parentGenome) {
    for(var i in parentGenome) {
      if(parentGenome[i] !== null && i !== 'archon' && typeof parentGenome[i] !== 'function') {
        this[i].inherit(parentGenome[i]);
      }
    }
  }
};

var primordialGenome = {
  avoidDangerousPreyFactor: new Archonia.Form.ScalarGene(10),
  birthThresholdMultiplier: new Archonia.Form.ScalarGene(1),
  color: new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 100%, 50%)')),
  feedingAccelerationDamper: new Archonia.Form.ScalarGene(1),
  feedingSpeedDamper: new Archonia.Form.ScalarGene(1),
  hungerMultiplier: new Archonia.Form.ScalarGene(0.0005),
  injuryFactorThreshold: new Archonia.Form.ScalarGene(0.5),
  maxMAcceleration: new Archonia.Form.ScalarGene(15),
  maxMVelocity: new Archonia.Form.ScalarGene(75),
  optimalMass: new Archonia.Form.ScalarGene(5),
  offspringEnergy: new Archonia.Form.ScalarGene(200),
  parasiteChaseFactor: new Archonia.Form.ScalarGene(1),
  parasiteFlightFactor: new Archonia.Form.ScalarGene(10),
  sensorScale: new Archonia.Form.ScalarGene(1),
  targetChangeDelay: new Archonia.Form.ScalarGene(5),
  tasteFactor: new Archonia.Form.ScalarGene(100),
  tempFactor: new Archonia.Form.ScalarGene(1),
  tempRange: new Archonia.Form.ScalarGene(400),
  tempRangeDamping: new Archonia.Form.ScalarGene(0.5),

  // dummy entries so the getters will work
  optimalTemp: null,
  optimalHiTemp: null,
  optimalLoTemp: null
};

Archonia.Cosmos.Genomer = {
  
  genomifyMe: function(archon) {
    archon.genome = new Archonia.Form.Genome(archon, primordialGenome);
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
  module.exports = { Cosmos: Archonia.Cosmos, Form: Archonia.Form };
}
