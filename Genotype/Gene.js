/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};


if(typeof window === "undefined") {
  tinycolor = require('../TinyColor/tinycolor.js');
}

(function(Archonia) {
  
Archonia.Form.Gene = function() {
  // Archonia always begins with a 10% chance of a +/- 10% change
  this.changeProbability = 10;
  this.changeRange = 10;
};

Archonia.Form.Gene.prototype = {
  inherit: function() { Archonia.Axioms.hurl(new Error("Gene base class doesn't inherit")); },
  
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
    if(Archonia.Cosmos.Archonery.momentOfCreation) { probability *= 10; range *= 10; }

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
  
  if(this.value < 0) { Archonia.Axioms.hurl(new Archonia.Essence.BirthDefect("Scalar gene value < 0")); }
};

Archonia.Form.ColorGene = function(gene) { this.color = tinycolor(gene); Archonia.Form.Gene.call(this); };

Archonia.Form.ColorGene.prototype = Object.create(Archonia.Form.Gene.prototype);
Archonia.Form.ColorGene.prototype.constructor = Archonia.Form.ColorGene;
Archonia.Form.ColorGene.prototype.newGene = function() { return new Archonia.Form.ColorGene(); };

Archonia.Form.ColorGene.prototype.inherit = function(parentGene) {
  this.mutateMutatability(parentGene);
  
  var color = tinycolor(parentGene.color);
  var hsl = color.toHsl();
  
  // Because tinycolor stores them 0 - 1 but hsl string wants 0 - 100%
  hsl.s *= 100; hsl.l *= 100;
  
  var h = this.mutateScalar(hsl.h, 90); // Make the domain sizes artificially small to
  var s = this.mutateScalar(hsl.s, 25); // limit the amount of color change between
  var L = this.mutateScalar(hsl.l, 25); // generations. I like to see some signs of inheritance
  
  // In case tinycolor doesn't like long strings of decimals
  h = h.toFixed(); s = s.toFixed(); L = L.toFixed();
  
  hsl = 'hsl(' + h + ', ' + s + '%, ' + L + '%)';
  this.color = tinycolor(hsl);

  var r = this.getTempRange();
  if(r < 0 || r > Archonia.Axioms.temperatureHi || s < 0 || s > 100 || L < 0 || L > 100) {
    Archonia.Axioms.hurl(new Archonia.Essence.BirthDefect("Bad color gene: " + hsl));
  }
};

Archonia.Form.ColorGene.prototype.getColorAsDecimal = function() { return parseInt(this.color.toHex(), 16); };
Archonia.Form.ColorGene.prototype.getTempRadius = function() { return this.getTempRange() / 2; };
Archonia.Form.ColorGene.prototype.getOptimalTempHi = function() { return this.getOptimalTemp() + this.getTempRange() / 2; };
Archonia.Form.ColorGene.prototype.getOptimalTempLo = function() { return this.getOptimalTemp() - this.getTempRange() / 2; };

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

})(Archonia);

if(typeof window === "undefined") {
  module.exports = {
    Gene: Archonia.Form.Gene, ScalarGene: Archonia.Form.ScalarGene, ColorGene: Archonia.Form.ColorGene
  };
}
