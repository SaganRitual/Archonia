var Axioms = require('../../Axioms.js');

var Genome = function() {
  this.optimalTemp = 0;
  this.tempRange = 400;
  
  this.optimalHiTemp = this.optimalTemp + this.tempRange / 2;
  this.optimalLoTemp = this.optimalTemp - this.tempRange / 2;

  this.howLongBadTempToEncystment = 5;
  this.foodSearchTimeBetweenTurns = 5;
  
  this.food =          { multiplier: 1, decayRate: 0.1, valuesRangeLo: 0, valuesRangeHi: Axioms.caloriesPerManna };
  this.predator =      { multiplier: 1, decayRate: 0.1, valuesRangeLo: 0, valuesRangeHi: 1 };
  this.prey =          { multiplier: 1, decayRate: 0.1, valuesRangeLo: 0, valuesRangeHi: 1 };
  this.hunger =        { multiplier: 1, decayRate: 0.1, valuesRangeLo: 1000, valuesRangeHi: 0 };
  this.temperature =   { multiplier: 1, decayRate: 0.1, valuesRangeLo: this.optimalLoTemp, valuesRangeHi: this.optimalHiTemp };
  this.toxin =         { multiplier: 1, decayRate: 0.1, valuesRangeLo: 0, valuesRangeHi: 1 };

  this.senseMeasurementDepth = 10;
  this.inertialDamper = 0.02;
  this.maxMVelocity = 5;
};

module.exports = Genome;