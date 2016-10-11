/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.SensorArray = require('../test/support/mockSensorArray.js');
  Archonia.Form.XY = require('../widgets/XY.js').XY;
}

(function(Archonia) {
  
  Archonia.Form.Urge = function(urgeToward, brain, senseGenes, velocityControl, measurementDepth, howManyMeasurementPoints) {
    if(
      typeof urgeToward !== "boolean" ||
      brain === undefined || brain.archoniaUniqueID === undefined ||
      senseGenes === undefined || senseGenes.inertialDamper === undefined ||
      velocityControl === undefined || velocityControl.x === undefined ||
      typeof measurementDepth !== "number" || typeof howManyMeasurementPoints !== "number") {
      throw new Error("Bad args");
    }
    
    this.velocityControl = velocityControl;
    this.active = false;
    this.signalMultiplier = senseGenes.signalMultiplier;
    this.maxMVelocity = senseGenes.maxMVelocity;
    
    var lo = urgeToward ? senseGenes.valuesRangeLo : senseGenes.valuesRangeHi;
    var hi = urgeToward ? senseGenes.valuesRangeHi : senseGenes.valuesRangeLo;

    this.sensorArray = new Archonia.Form.SensorArray(
      howManyMeasurementPoints, senseGenes.measurementDepth, senseGenes.decayRate, lo, hi
    );
    
    brain.register(this);
  };
  
  Archonia.Form.Urge.prototype = {
    disable: function() { this.active = false; },
    enable: function() { this.active = true; },
    
    getBestSignal: function(spread) {
      var signalData = this.sensorArray.getBestSignal(spread);
      return signalData.weight * this.signalMultiplier;
    }
  };
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Urge;
}
