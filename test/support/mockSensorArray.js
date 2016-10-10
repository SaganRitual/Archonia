var SensorArray = function(howManyMeasurementPoints, measurementDepth, decayRate, valuesRangeLo, valuesRangeHi) {
  this.empty = true;
  this.bestSignal = {};
};

SensorArray.prototype = {
  getAverage: function(index, spread) {
    return 0;
  },
  
  getBestSignal: function(spread) {
    return this.bestSignal;
  },
  
  isEmpty: function() { return this.empty; },
  
  reset: function() {
    this.empty = true;
  },
  
  setDirection: function(direction) { this.bestSignal.direction = direction; },
  setReturnValue: function(bestSignal) { this.bestSignal = bestSignal; },

  store: function(where, value) {
    this.bestSignal = { weight: value, direction: 0};
    this.empty = false;
  }
};

module.exports = SensorArray;
