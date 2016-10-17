/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Form.Cbuffer = require('./Cbuffer.js');
  Archonia.Form.SignalSmoother = require('./SignalSmoother.js');
}

(function(Archonia) {

Archonia.Form.SensorArray = function(howManyMeasurementPoints, measurementDepth, decayRate, valuesRangeLo, valuesRangeHi) {
  this.id = Archonia.Essence.archoniaUniqueObjectId++;

  this.empty = true;
  this.howManyMeasurementPoints = howManyMeasurementPoints;
  
  this.signalSmoothers = [];
  
  for(var i = 0; i < howManyMeasurementPoints; i++) {
    this.signalSmoothers.push(new Archonia.Form.SignalSmoother(measurementDepth, decayRate, valuesRangeLo, valuesRangeHi));
  }
  
  this.averagesRounder = new Archonia.Form.Cbuffer(howManyMeasurementPoints, 0, 0, howManyMeasurementPoints);
  
};

Archonia.Form.SensorArray.prototype = {
  getAverage: function(index, spread) {
    var e = this.averagesRounder.getSpreadAt(index, spread);
    
    var t = 0;
    for(var i = 0; i < spread; i++) { t += e[i]; }
    
    return t / spread;
  },
  
  getBestSignal: function(spread) {
    if(spread === undefined) { spread = 1; }
    
    var i = null;
    
    // The signalSmoothers are in a cicle around us, so we
    // need a wheel to get the spread averages and
    // identify the index of the best one
    for(i = 0; i < this.howManyMeasurementPoints; i++) {
      this.averagesRounder.store(this.signalSmoothers[i].getSignalStrength());
    }
  
    var result = { direction: null, weight: null };
    
    for(i = 0; i < this.howManyMeasurementPoints; i++) {
      var r = this.getAverage(i, spread);

      if(result.weight === null || r > result.weight) { result.direction = i; result.weight = r; }
    }
  
    return result;
  },
  
  isEmpty: function() { return this.empty; },
  
  reset: function() {
    for(var i = 0; i < this.howManyMeasurementPoints; i++) { this.signalSmoothers[i].reset(); }

    this.empty = true;
  },

  store: function(where, value) {
    this.empty = false;
    this.signalSmoothers[where].store(value);
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.SensorArray;
}
