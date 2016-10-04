/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('../Archonia.js');
  A.Range = require('./Range.js');
  A.Cbuffer = require('./Cbuffer.js');
}

(function(A) {
  
A.SignalSmoother = function(depth, decayRate, rangeLo, rangeHi) {
  if(rangeLo === undefined) { rangeLo = 0; }
  if(rangeHi === undefined) { rangeHi = 1; }

  this.empty = true;
  this.depth = depth;
  this.rangeLo = rangeLo;
  this.rangeHi = rangeHi;

  this.decayRate = decayRate; // Not scaled; always expressed as points on 0 - 1 scale
  
  this.cbuffer = new A.Cbuffer(depth);
  this.valuesRange = new A.Range(rangeLo, rangeHi);
};

A.SignalSmoother.prototype = {
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
    var s = A.zeroToOneRange.convertPoint(value, this.valuesRange);

    s = A.clamp(s, 0, 1);
  
    this.cbuffer.store(s);

    this.cbuffer.deepForEach(function(ix, points) {
      points[ix] -= this.decayRate;
      points[ix] = A.clamp(points[ix], 0, 1);
    }, this);
    
    this.empty = false;
  }
};

})(A);

if(typeof window === "undefined") {
  module.exports = A.SignalSmoother;
}
