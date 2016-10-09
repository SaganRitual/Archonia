var A = {};

var XY = require('../../widgets/XY.js').XY;

(function(Archon) {

  var adultCalories = 100, larvalCalories = 100, embryoThreshold = 200, reproductionThreshold = 500;
  var hungerLo = embryoThreshold + reproductionThreshold, hungerHi = 0;

  var optimalTemp = -200, optimalTempRange = 400;
  var tempRadius = optimalTempRange / 2, tempLo = optimalTemp, tempHi = optimalTemp + tempRadius;

  var senseMeasurementDepth = 10, caloriesPerManna = 100;

  var reproductionCostFactor = 1.25;
  
  A.Archon = function() {
    
  };
  
  A.Archon.prototype = {
    getSize: function() { return 2; },
    moveTo: function(where) { this.velocity.set(where); },
    position: XY(42, 137),
    velocity: XY(),
    
    genome: {
      foodSearchTimeBetweenTurns: 15,
      
      optimalTemp: optimalTemp, optimalTempRange: optimalTempRange,
    
      offspringMass: { adultCalories: adultCalories, larvalCalories: larvalCalories },
    
      reproductionThreshold: reproductionThreshold, embryoThreshold: embryoThreshold,
    
      senseMeasurementDepth: senseMeasurementDepth,
      
      inertialDamper: 0.02,
    
      senses: {
        fatigue:     { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        food:        { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: caloriesPerManna },
        predator:    { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        prey:        { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 },
        hunger:      { multiplier: 1, decayRate: 0.01, valuesRangeLo: hungerLo, valuesRangeHi: hungerHi },
        temperature: { multiplier: 1, decayRate: 0.01, valuesRangeLo: tempLo, valuesRangeHi: tempHi },
        toxin:       { multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 }
      }
    }
  }
})(A);

module.exports = A;