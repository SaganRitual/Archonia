/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
  A.SensorArray = require('./widgets/SensorArray.js');
}

(function(A) {

A.Brain = function(archon) {
  this.id = A.archoniaUniqueObjectId++;
  this.archon = archon;
  
  var gSenses = archon.genome.senses;

  this.defaultAction = { action: 'searchForFood', direction: 0, signalWeight: 0 };
  
  this.currentAction = Object.assign({}, this.defaultAction);
  
  var senseAddons = {
    fatigue:     { howManyPoints:  1, signalSpread:  1, action: 'moveToSecure' },
    food:        { howManyPoints: 12, signalSpread: 12, action: 'eat' },
    predator:    { howManyPoints: 12, signalSpread: 12, action: 'flee' },
    prey:        { howManyPoints: 12, signalSpread: 12, action: 'pursue' },
    hunger:      { howManyPoints:  1, signalSpread:  1, action: 'searchForFood' },
    temperature: { howManyPoints:  2, signalSpread:  2, action: 'findSafeTemp' },
    toxin:       { howManyPoints: 12, signalSpread: 12, action: 'toxinDefense' }
  };
  
  this.senseControls = {};
  
  for(var senseNameInGenome in gSenses) {
    this.senseControls[senseNameInGenome] = {};
    
    var gSense = gSenses[senseNameInGenome], pSense = this.senseControls[senseNameInGenome], extra = senseAddons[senseNameInGenome];
    
    for(var ee in extra) { pSense[ee] = extra[ee]; }  // Copy the extra gene-related info to the sense info

    this.senseControls[senseNameInGenome].sensorArray = new A.SensorArray(
      extra.howManyPoints, this.archon.genome.senseMeasurementDepth, gSense.decayRate, gSense.valuesRangeLo, gSense.valuesRangeHi
    );
  }
};

A.Brain.prototype = {
  chooseAction: function() {
    
    this.currentAction = Object.assign({}, this.defaultAction);

    for(var s in this.senseControls) {
      var genomeSenseControls = this.archon.genome.senses[s];
      var brainSenseControls = this.senseControls[s];
      var inputSignal = null;
      
      if(brainSenseControls.sensorArray.isEmpty()) {
        throw new Error("Sensors should never be empty");
      } else {
        
        inputSignal = brainSenseControls.sensorArray.getBestSignal(brainSenseControls.signalSpread);
        
        var effectiveSignalStrength = inputSignal.weight * genomeSenseControls.multiplier;

        if(effectiveSignalStrength > this.currentAction.signalWeight + this.archon.genome.inertialDamper) {

          this.currentAction.signalWeight = effectiveSignalStrength;
          this.currentAction.action = brainSenseControls.action;
          this.currentAction.direction = inputSignal.direction;

        }
      }
    }

    return this.currentAction;
  },
  
  launch: function() {
    
  },
  
  senseFatigue: function(where, fatigue) {
    this.senseControls.fatigue.sensorArray.store(where, fatigue);
  },
  
  senseHunger: function(where, hunger) {
    this.senseControls.hunger.sensorArray.store(where, hunger);
  },
  
  senseFood: function(where, food) {
    this.senseControls.food.sensorArray.store(where, food);
  },

  sensePredator: function(where, predator) {
    this.senseControls.predator.sensorArray.store(where, predator);
  },

  sensePrey: function(where, prey) {
    this.senseControls.prey.sensorArray.store(where, prey);
  },
  
  senseTemperature: function(where, temp) {
    this.senseControls.temperature.sensorArray.store(where, temp);
  },
  
  senseToxin: function(where, toxin) {
    this.senseControls.toxin.sensorArray.store(where, toxin);
  },
  
  tick: function() {

  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Brain;
}
