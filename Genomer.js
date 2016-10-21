/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.tinycolor = require('./widgets/tinycolor.js');
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
} else{
  Archonia.Form.tinycolor = window.tinycolor;
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
Archonia.Form.ColorGene.prototype.getTempRadius = function() { return this.getTempRange() / 2; };
Archonia.Form.ColorGene.prototype.getoptimalTempHi = function() { return this.getOptimalTemp() + this.getTempRange() / 2; };
Archonia.Form.ColorGene.prototype.getoptimalTempLo = function() { return this.getOptimalTemp() - this.getTempRange() / 2; };

Archonia.Form.ColorGene.prototype.getOptimalTemp = function() {
  var L = this.color.toHsl().l;
  var t = Archonia.Essence.worldTemperatureRange.convertPoint(L, Archonia.Essence.oneToZeroRange);
  return t;
};

Archonia.Form.ColorGene.prototype.getTempRange = function() {
  var h = this.color.toHsl().h;
  var r = Archonia.Essence.archonTolerableTempRange.convertPoint(h, Archonia.Essence.hueRange);
  return r;
};

Archonia.Form.SenseGene = function(multiplier, decayRate, valuesRangeLo, valuesRangeHi) {
  this.multiplier = multiplier;
  this.decayRate = decayRate;
  this.valuesRangeLo = valuesRangeLo;
  this.valuesRangeHi = valuesRangeHi;
  
  this.isSenseGene = true;
  
  Archonia.Form.Gene.call(this);
};

Archonia.Form.SenseGene.prototype = Object.create(Archonia.Form.Gene.prototype);
Archonia.Form.SenseGene.prototype.constructor = Archonia.Form.SenseGene;
Archonia.Form.SenseGene.prototype.newGene = function() { throw new Error("SenseGene.newGene() is pure virtual"); };
Archonia.Form.SenseGene.prototype.inherit = function(parentGene) {
  this.mutateMutatability(parentGene);

  this.multiplier = this.mutateScalar(parentGene.multiplier);
  this.decayRate = this.mutateScalar(parentGene.decayRate);
  this.valuesRangeLo = this.mutateScalar(parentGene.valuesRangeLo);
  this.valuesRangeHi = this.mutateScalar(parentGene.valuesRangeHi);
};

Archonia.Form.SenseGeneFixed = function(multiplier, decayRate, valuesRangeLo, valuesRangeHi) {
  Archonia.Form.SenseGene.call(this, multiplier, decayRate, valuesRangeLo, valuesRangeHi);
};

Archonia.Form.SenseGeneFixed.prototype = Object.create(Archonia.Form.SenseGene.prototype);
Archonia.Form.SenseGeneFixed.prototype.constructor = Archonia.Form.SenseGeneFixed;
Archonia.Form.SenseGeneFixed.prototype.newGene = function() { return new Archonia.Form.SenseGeneFixed(); };

Archonia.Form.SenseGeneFixed.prototype.inherit = function(parentGene) {
  Archonia.Form.SenseGene.prototype.inherit.call(this, parentGene);
};

Archonia.Form.SenseGeneVariable = function(multiplier, decayRate, valuesRangeLo, valuesRangeHi) {
  Archonia.Form.SenseGene.call(this, multiplier, decayRate, valuesRangeLo, valuesRangeHi);
};

Archonia.Form.SenseGeneVariable.prototype = Object.create(Archonia.Form.SenseGene.prototype);
Archonia.Form.SenseGeneVariable.prototype.constructor = Archonia.Form.SenseGeneVariable;
Archonia.Form.SenseGeneVariable.prototype.newGene = function() { return new Archonia.Form.SenseGeneVariable(); };

Archonia.Form.SenseGeneVariable.prototype.inherit = function(parentGene) {
  Archonia.Form.SenseGene.prototype.inherit.call(this, parentGene);
  this.valuesRangeLo = this.mutateScalar(parentGene.valuesRangeLo);
  this.valuesRangeHi = this.mutateScalar(parentGene.valuesRangeHi);
};

Archonia.Form.Genome = function(archon, parentGenome) {
  this.archon = archon;
  this.core = {};
  
  for(var i in parentGenome.core) {
    if(parentGenome.core[i] === null) {
      this.core[i] = null; // For dummy properties so our getters will work -- I hope!
    } else {
      this.core[i] = parentGenome.core[i].newGene();
    }
  }
};

Archonia.Form.Genome.prototype = {
  inherit: function(parentGenome) {
    for(var i in parentGenome.core) { 
      if(this.core[i] !== null) {
        this.core[i].inherit(parentGenome.core[i]);
      }
    }
  }
};

var primordialGenome = { core: {
  color:                     new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 100%, 50%)')),

  hungerToleranceFactor:     new Archonia.Form.ScalarGene(0.75),
  maxMAcceleration:          new Archonia.Form.ScalarGene(15),
  maxMVelocity:              new Archonia.Form.ScalarGene(30),
  sensorScale:               new Archonia.Form.ScalarGene(Archonia.Axioms.standardSensorScale),
  targetChangeDelay:         new Archonia.Form.ScalarGene(5),
  tempToleranceFactor:       new Archonia.Form.ScalarGene(1),
  
  birthMassAdultCalories:      new Archonia.Form.ScalarGene(100),
  birthMassLarvalCalories:     new Archonia.Form.ScalarGene(100),
  offspringMassLarvalCalories: new Archonia.Form.ScalarGene(100),
  offspringMassAdultCalories:  new Archonia.Form.ScalarGene(100),

  calorieGainToAttemptFromPredation: new Archonia.Form.ScalarGene(10 * Archonia.Axioms.caloriesPerManna),

  // dummy entries so the getters will work
  optimalTemp: null,
  optimalTempHi: null,
  optimalTempLo: null,
  tempRange: null,
  tempRadius: null,
  
  reproductionThreshold:       new Archonia.Form.ScalarGene(500),
  embryoThreshold:             new Archonia.Form.ScalarGene(200),
  encystThreshold:             new Archonia.Form.ScalarGene(0.85),
  unencystThreshold:           new Archonia.Form.ScalarGene(0.50),
  tempSignalBufferSize:        new Archonia.Form.ScalarGene(10),
  tempSignalDecayRate:         new Archonia.Form.ScalarGene(0.03)
  
} };

var genomePrototypeSetup = false;

Archonia.Cosmos.Genomer = {
  
  genomifyMe: function(archon) {
    if(!genomePrototypeSetup) { Archonia.Cosmos.Genomer.setupGenomePrototype(); }
    
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
  },
  
  setupGenomePrototype: function() {
    genomePrototypeSetup = true;
    
    for(var i in primordialGenome.core) {
      switch(i) {
      case 'color':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function()  { return this.core.color.getColorAsDecimal(); } }
        );
        break;
      
      case 'optimalTempHi':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function () { return this.core.color.getoptimalTempHi();  } }
        );
        break;
      
      case 'optimalTempLo':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function () { return this.core.color.getoptimalTempLo(); } }
        );
        break;
      
      case 'optimalTemp':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function () { return this.core.color.getOptimalTemp(); } }
        );
        break;
      
      case 'tempRange':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function () { return this.core.color.getTempRange(); } }
        );
        break;
      
      case 'tempRadius':
        Object.defineProperty(Archonia.Form.Genome.prototype, i,
          { get: function () { return this.core.color.getTempRadius(); } }
        );
        break;
      
      default:
        Object.defineProperty(Archonia.Form.Genome.prototype, i, (
          function(propertyName) {
            return {
              get: function() { 
                if(this.core.hasOwnProperty(propertyName)) {
                  if(this.core[propertyName].isSenseGene) {
                    return this.core[propertyName];
                  } else {
                    return this.core[propertyName].value;
                  }
                } else {
                  throw new Error("No such property '" + propertyName + "' in genome");
                }
              },
            
              set: function(value) {
                if(this.core.hasOwnProperty(propertyName)) {
                  if(this.core[propertyName].isSenseGene) {
                    throw new Error("SenseGene is not scalar; can't be set");
                  } else {
                    this.core[propertyName].value = value; return true;
                  }
                } else {
                  throw new Error("No such property '" + propertyName + "' in genome");
                }
              }
            };
          })(i));
        break;
      }
    }
  }
};


})(Archonia);

if(typeof window === "undefined") {
  module.exports = {
    Genomer: Archonia.Cosmos.Genomer,
    Gene: Archonia.Form.Gene,
    ScalarGene: Archonia.Form.ScalarGene,
    ColorGene: Archonia.Form.ColorGene,
    SenseGene: Archonia.Form.SenseGene,
    SenseGeneFixed: Archonia.Form.SenseGeneFixed,
    SenseGeneVariable: Archonia.Form.SenseGeneVariable
  };
}
