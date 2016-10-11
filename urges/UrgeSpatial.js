/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Form.XY = require('../widgets/XY.js').XY;
  Archonia.Form.Urge = require('./Urge.js');
  Archonia.Form.SensorArray = require('../test/support/mockSensorArray.js');
}

(function(Archonia) {
  
  Archonia.Form.UrgeSpatial = function(urgeToward, brain, senseGenes, velocityControl, measurementDepth) {
    Archonia.Form.Urge.call(
      this, urgeToward, brain, senseGenes, velocityControl, measurementDepth, Archonia.Axioms.howManyPointsForSpatialInputs
    );
  };

  Archonia.Form.UrgeSpatial.prototype = Object.create(Archonia.Form.Urge.prototype);
  Archonia.Form.UrgeSpatial.prototype.constructor = Archonia.Form.UrgeSpatial;
  
  Archonia.Form.UrgeSpatial.prototype.tick = function() {
    if(this.active) {
      var signalData = this.sensorArray.getBestSignal(this.signalAveragingSpread);
    
      var robalizedAngle = (
        signalData.direction * (2 * Math.PI / Archonia.Axioms.howManyPointsForSpatialInputs)
      );
      
      var computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
    
      this.velocityControl.set(Archonia.Form.XY.fromPolar(this.maxMVelocity, computerizedAngle));
    }
  };

  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.UrgeSpatial;
}
