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
  this.archon = archon;
  
  this.senses = {}; var gSenses = archon.genome.senses, pSenses = this.senses;

  this.inertiaAction = {
    action: 'launch', direction: 0,
    signalWeight: gSenses.inertia.threshold * gSenses.inertia.multiplier
  };
  
  this.currentAction = Object.assign({}, this.inertiaAction);
  
  var senseAddons = {
    fatigue:     { howManyPoints:  1, signalSpread:  1, action: 'moveToSafety' },
    food:        { howManyPoints: 12, signalSpread: 12, action: 'eat' },
    inertia:     { howManyPoints:  1, signalSpread:  1, action: 'sleep?' },
    predators:   { howManyPoints: 12, signalSpread: 12, action: 'flee' },
    prey:        { howManyPoints: 12, signalSpread: 12, action: 'pursue' },
    hunger:      { howManyPoints:  1, signalSpread:  1, action: 'searchForFood' },
    temperature: { howManyPoints:  2, signalSpread:  2, action: 'findGoodTemp' },
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
  
  pSenses.temperature.isEmergency = false;
};

A.Cobber.prototype = {
  chooseAction: function() {
    
    this.currentAction = Object.assign({}, this.inertiaAction);

    for(var s in this.senses) {
      var sense = this.senses[s], inputSignal = null;
      
      if(!sense.coblet.isEmpty()) {
        
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
  
  senseArchon: function(/*who*/) {
    
  },
  
  senseFatigue: function() {
    
  },
  
  senseHunger: function(where, hunger) {
    this.senses.hunger.coblet.store(where, hunger);
  },
  
  senseInertia: function() {
    
  },
  
  senseFood: function(where, food) {
    this.senses.food.coblet.store(where, food.calories);
  },
  
  senseTemperature: function(where, temp) {
    var deltaFromOptimal = Math.abs(temp - this.archon.genome.optimalTemp);
    
    this.senses.temperature.coblet.store(where, deltaFromOptimal);
  },
  
  senseToxins: function() {
    
  },
  
  tick: function() {

  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Cobber;
}
