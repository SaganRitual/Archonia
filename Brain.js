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
  
  this.senses = {}; var gSenses = archon.genome.senses, pSenses = this.senses;

  this.inertiaAction = { action: 'sleep?', direction: 0, signalWeight: 0 };
  
  this.currentAction = Object.assign({}, this.inertiaAction);
  
  var senseAddons = {
    fatigue:     { howManyPoints:  1, signalSpread:  1, action: 'moveToSafety' },
    food:        { howManyPoints: 12, signalSpread: 12, action: 'eat' },
    inertia:     { howManyPoints:  1, signalSpread:  1, action: 'sleep?' },
    predator:    { howManyPoints: 12, signalSpread: 12, action: 'flee' },
    prey:        { howManyPoints: 12, signalSpread: 12, action: 'pursue' },
    hunger:      { howManyPoints:  1, signalSpread:  1, action: 'searchForFood' },
    temperature: { howManyPoints:  2, signalSpread:  2, action: 'findSafeTemp' },
    toxin:       { howManyPoints: 12, signalSpread: 12, action: 'move' }
  };
  
  for(var gs in gSenses) {
    pSenses[gs] = {};
    
    var gSense = gSenses[gs], pSense = pSenses[gs], extra = senseAddons[gs];
    
    for(var ee in extra) { pSense[ee] = extra[ee]; }  // Copy the extra gene-related info to the sense info

    pSenses[gs].sensorArray = new A.SensorArray(
      extra.howManyPoints, this.archon.genome.senseMeasurementDepth, gSense.decayRate, gSense.valuesRangeLo, gSense.valuesRangeHi
    );
    
    for(var gg in gSense) {
      var gene = gSense[gg];
      
      pSense[gg] = gene;
    }
  }
};

A.Brain.prototype = {
  chooseAction: function() {
    
    this.currentAction = Object.assign({}, this.inertiaAction);

    for(var s in this.senses) {
      var sense = this.senses[s], inputSignal = null;
      
      if(sense.sensorArray.isEmpty()) {
        throw new Error("Sensors should never be empty");
      } else {
        
        inputSignal = sense.sensorArray.getBestSignal(sense.signalSpread);
        
        var effectiveSignalStrength = inputSignal.weight * sense.multiplier;

        if(effectiveSignalStrength > this.currentAction.signalWeight) {

          this.currentAction.signalWeight = effectiveSignalStrength;
          this.currentAction.action = sense.action;
          this.currentAction.direction = inputSignal.direction;

        }
      }
    }

    return this.currentAction;
  },
  
  launch: function() {
    
  },
  
  senseFatigue: function(where, fatigue) {
    this.senses.fatigue.sensorArray.store(where, fatigue);
  },
  
  senseHunger: function(where, hunger) {
    this.senses.hunger.sensorArray.store(where, hunger);
  },
  
  senseFood: function(where, food) {
    this.senses.food.sensorArray.store(where, food.calories);
  },
  
  senseInertia: function(where, inertia) {
    this.senses.inertia.sensorArray.store(where, inertia);
  },

  sensePredator: function(where, predator) {
    this.senses.predator.sensorArray.store(where, predator);
  },

  sensePrey: function(where, prey) {
    this.senses.prey.sensorArray.store(where, prey);
  },
  
  senseTemperature: function(where, temp) {
    this.senses.temperature.sensorArray.store(where, temp);
  },
  
  senseToxin: function(where, toxin) {
    this.senses.toxin.sensorArray.store(where, toxin);
  },
  
  tick: function() {

  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Brain;
}
