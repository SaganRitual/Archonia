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
  var decayRate = 0.01;

A.Coblet = function(howManyPoints, gatherer, valuesRangeLo, valuesRangeHi) {
  gatherer.call(this);
  this.gatherer = gatherer;
  this.valuesRange = new A.Range(valuesRangeLo, valuesRangeHi);
  this.rounders = [];
  
  for(var i = 0; i < howManyPoints; i++) {
    this.rounders.push(new A.Utilities.Rounder(roundersRunningAverageDepth));
  }
};

A.Coblet.prototype = {
  getAverages: function() {
    var averages = [];

    for(var i = 0; i < this.rounders.length; i++) {
      var rounder = this.rounders[i];
      var total = 0;
      var valuesCount = 0;
      
      rounder.forEach(function(ix, value) { total += value; valuesCount++; }, rounder);
      
      averages.push(total / valuesCount);
    }

    return averages;
  },
  
  getBestSignal: function() {
    var averages = this.getAverages(), bestValue = null, bestDirection = null;
    
    for(var i = 0; i < averages.length; i++) {
      var value = averages[i];
      
      if(bestValue === null || value > bestValue) { bestValue = value; bestDirection = i; }
    }
    
    return { direction: bestDirection, weight: bestValue };
  },
  
  reset: function() { for(var i = 0; i < this.points.length; i++) { this.points[i] = 0; } },
  
  tick: function() {
    var p = this.gatherer.call(this);
    
    if(!(p instanceof Array)) { throw new ReferenceError("Coblet callback must return an array"); }
    
    for(var i = 0; i < p.length; i++) {
      var rounder = this.rounders[i];
      var s = A.zeroToOneRange.convertPoint(p[i], this.valuesRange);
  
      s = A.clamp(s, 0, 1);
    
      rounder.store(s);
    
      rounder.deepForEach(function(ix, points) {
        points[ix] -= decayRate;
        points[ix] = A.clamp(points[ix], 0, 1);
      }, this);
    }
  }
};

A.Cobber = function(archon) {
  this.genome = archon.genome;
  
  this.inputs = {
    food: null, temperature: null, predators: null, prey: null, hunger: null, toxins: null, inertia: null, fatigue: null
  };
};

A.Cobber.prototype = {
  launch: function() {
    
  }
};

})(A);

if(typeof window === "undefined") {
  module.exports = A.Cobber;
}
