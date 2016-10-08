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

  this.empty = true;
  this.depth = depth;
  this.rangeLo = rangeLo;
  this.rangeHi = rangeHi;

  this.decayRate = decayRate; // Not scaled; always expressed as points on 0 - 1 scale
  
  this.cbuffer = new Archonia.Form.Cbuffer(depth);
  this.valuesRange = new Archonia.Form.Range(rangeLo, rangeHi);
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
    var s = Archonia.Essence.zeroToOneRange.convertPoint(value, this.valuesRange);

    s = Archonia.Axioms.clamp(s, 0, 1);
  
    this.cbuffer.store(s);

    this.cbuffer.deepForEach(function(ix, points) {
      points[ix] -= this.decayRate;
      points[ix] = Archonia.Axioms.clamp(points[ix], 0, 1);
    }, this);
    
    this.empty = false;
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.SignalSmoother;
}
