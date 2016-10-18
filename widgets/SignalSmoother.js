/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Essence = require('../Essence.js');
  Archonia.Form.Range = require('./Range.js');
  Archonia.Form.Cbuffer = require('./Cbuffer.js');
}

(function(Archonia) {
  
Archonia.Form.SignalSmoother = function(depth, decayRate, rangeLo, rangeHi) {
  if(rangeLo === undefined) { rangeLo = 0; }
  if(rangeHi === undefined) { rangeHi = 1; }

  this.zeroCentered = rangeLo < 0 && rangeHi > 0;
  if(this.zeroCentered && (rangeLo + rangeHi) !== 0) {
    throw new Error("Scale across zero must be centered on zero");
  }
  
  if(this.zeroCentered) { this.storedValuesRange = Archonia.Essence.centeredZeroRange; }
  else { this.storedValuesRange = Archonia.Essence.zeroToOneRange; }
  
  this.empty = true;
  this.depth = depth;
  this.rangeLo = rangeLo;
  this.rangeHi = rangeHi;

  this.decayRate = decayRate; // Not scaled; always expressed as points on 0 - 1 scale
  
  this.cbuffer = new Archonia.Form.Cbuffer(depth);
  this.inputValuesRange = new Archonia.Form.Range(rangeLo, rangeHi);
};

Archonia.Form.SignalSmoother.prototype = {
  getSignalStrength: function() {
    var signalStrength = 0;
    
    this.cbuffer.forEach(function(ix, value) {
      signalStrength += value;
    });

    return signalStrength / this.depth;
  },
  
  isEmpty: function() { return this.empty; },

  reset: function() {
    this.cbuffer.reset();
    this.empty = true;
  },
  
  store: function(value) {
    var s = null;
    
    s = this.storedValuesRange.convertPoint(value, this.inputValuesRange);
    s = Archonia.Axioms.clamp(s, this.storedValuesRange.lo, this.storedValuesRange.hi);
  
    this.cbuffer.store(s);

    this.cbuffer.deepForEach(function(ix, points) {
      if(this.zeroCentered) {
        
        if(points[ix] > 0) { points[ix] -= this.decayRate; }
        else if(points[ix] < 0) { points[ix] += this.decayRate; }

      } else {
        points[ix] -= this.decayRate;
      }

      points[ix] = Archonia.Axioms.clamp(points[ix], this.storedValuesRange.lo, this.storedValuesRange.hi);
    }, this);
    
    this.empty = false;
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.SignalSmoother;
}
