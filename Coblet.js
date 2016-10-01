/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
  A.Range = require('./Range.js');
  A.Utilities = require('./Utilities.js');
}

(function(A) {

  var roundersRunningAverageDepth = 10;

A.Coblet = function(howManyPoints, gatherer, callbackContext, valuesRangeLo, valuesRangeHi, decayRate) {
  if(valuesRangeLo === undefined) { valuesRangeLo = 0; }
  if(valuesRangeHi === undefined) { valuesRangeHi = 1; }

  this.gatherer = gatherer;
  this.callbackContext = callbackContext;
  this.valuesRange = new A.Range(valuesRangeLo, valuesRangeHi);
  this.howManyPoints = howManyPoints;
  this.decayRate = decayRate; // Not scaled; always expressed as points on 0 - 1 scale
  
  this.reset();
};

A.Coblet.prototype = {
  getAverages: function() {
    for(var i = 0; i < this.rounders.length; i++) {
      var rounder = this.rounders[i];
      var total = 0;
      var valuesCount = 0;
      
      rounder.forEach(function(ix, value) { total += value; valuesCount++; }, rounder);
      
      this.averageRounder.store(total / valuesCount);
    }
  },
  
  getBestSignal: function(spread) {
    var bestValue = null, bestDirection = null;
    
    this.getAverages();
    
    // We want to return an index that is in the middle of the
    // spread. If the spread is even, randomly choose one or the
    // other element. If odd, just choose the center
    var center = Math.floor(spread / 2);
    if(spread % 2 === 0) {
      center += A.integerInRange(-1, 0);
    }
    
    for(var i = 0; i < this.howManyPoints; i++) {
      var value = this.getSpreadAverage(i - center, spread);
      
      if(bestValue === null || value > bestValue) { bestValue = value; bestDirection = i; }
    }
    
    return { direction: bestDirection, weight: bestValue };
  },
  
  getSpreadAverage: function(index, spread) {
    var slice = this.averageRounder.slice(index, spread), average = 0;
    for(var i = 0; i < spread; i++) {
      average += slice[i];
    }
    
    return average / spread;
  },
  
  reset: function() {
    this.rounders = [];
    this.isEmpty = true;
    this.rounders = [];
  
    for(var i = 0; i < this.howManyPoints; i++) {
      this.rounders.push(new A.Utilities.Rounder(roundersRunningAverageDepth));
    }
  
    this.averageRounder = new A.Utilities.Rounder(this.howManyPoints);
  },
  
  tick: function() {
    var p = this.gatherer.call(this.callbackContext);
    
    if(!(p instanceof Array)) { throw new ReferenceError("Coblet callback must return an array"); }
    if(p.length > this.rounders.length) { throw new ReferenceError("Coblet callback returned bad array"); }
    
    this.isEmpty = false;
    
    for(var i = 0; i < this.rounders.length; i++) {
      var rounder = this.rounders[i];
      var s = A.zeroToOneRange.convertPoint(p[i], this.valuesRange);
  
      s = A.clamp(s, 0, 1);
    
      rounder.store(s);
    
      rounder.deepForEach(function(ix, points) {
        points[ix] -= this.decayRate;
        points[ix] = A.clamp(points[ix], 0, 1);
      }, this);
    }
  }
};

})(A);

if(typeof window === "undefined") {
  module.exports = A.Coblet;
}
