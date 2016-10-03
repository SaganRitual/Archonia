/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
  A.Coblet = require('./Coblet.js');
}

(function(A) {

A.Cobber = function(archon) {
  this.id = A.archoniaUniqueObjectId++;
  this.archon = archon;
  
  this.senses = {}; var gSenses = archon.genome.senses, pSenses = this.senses;

  this.inertiaAction = { action: 'sleep?', direction: 0, signalWeight: 0 };
  
  this.currentAction = Object.assign({}, this.inertiaAction);
  
  var senseAddons = {
    fatigue:     { howManyPoints:  1, signalSpread:  1, action: 'moveToSafety' },
    food:        { howManyPoints: 12, signalSpread: 12, action: 'eat' },
    inertia:     { howManyPoints:  1, signalSpread:  1, action: 'sleep?' },
    predators:   { howManyPoints: 12, signalSpread: 12, action: 'flee' },
    prey:        { howManyPoints: 12, signalSpread: 12, action: 'pursue' },
    hunger:      { howManyPoints:  1, signalSpread:  1, action: 'searchForFood' },
    temperature: { howManyPoints:  2, signalSpread:  2, action: 'findSafeTemp' },
    toxins:      { howManyPoints: 12, signalSpread: 12, action: 'move' }
  };
  
  for(var gs in gSenses) {
    pSenses[gs] = {};
    
    var gSense = gSenses[gs], pSense = pSenses[gs], extra = senseAddons[gs];
    
    for(var ee in extra) { pSense[ee] = extra[ee]; }  // Copy the extra gene-related info to the sense info

    pSenses[gs].coblet = new A.Coblet(
      extra.howManyPoints, this.archon.genome.senseMeasurementDepth, gSense.decayRate, gSense.valuesRangeLo, gSense.valuesRangeHi
    );
    
    for(var gg in gSense) {
      var gene = gSense[gg];
      
      pSense[gg] = gene;
    }
  }
};

A.Cobber.prototype = {
  chooseAction: function() {
    
    this.currentAction = Object.assign({}, this.inertiaAction);

    for(var s in this.senses) {
      var sense = this.senses[s], inputSignal = null;
      
      if(sense.coblet.isEmpty()) {
        throw new Error("Sensors should never be empty");
      } else {
        
        inputSignal = sense.coblet.getBestSignal(sense.signalSpread);
        
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
    this.senses.fatigue.coblet.store(where, fatigue);
  },
  
  senseHunger: function(where, hunger) {
    this.senses.hunger.coblet.store(where, hunger);
  },
  
  senseFood: function(where, food) {
    this.senses.food.coblet.store(where, food.calories);
  },
  
  senseInertia: function(where, inertia) {
    this.senses.inertia.coblet.store(where, inertia);
  },

  sensePredator: function(where, predator) {
    this.senses.predators.coblet.store(where, predator);
  },

  sensePrey: function(where, prey) {
    this.senses.prey.coblet.store(where, prey);
  },
  
  senseTemperature: function(where, temp) {
    this.senses.temperature.coblet.store(where, temp);
  },
  
  senseToxins: function(where, toxin) {
    this.senses.toxins.coblet.store(where, toxin);
  },
  
  tick: function() {

  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Cobber;
}
