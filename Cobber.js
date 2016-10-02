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
  
  this.encapsulateAction = { action: 'encapsulate', direction: 0 };
  this.currentAction = this.encapsulateAction;
  
  this.cobs = {}; var gcobs = archon.genome.cobs, pcobs = this.cobs;

  var cobExtras = {
    fatigue: { howManyPoints: 1 }, food: { howManyPoints: 12 }, inertia: { howManyPoints: 1 },
    predators: { howManyPoints: 12 }, prey: { howManyPoints: 12 }, hunger: { howManyPoints: 1 },
    temperature: { howManyPoints: 2 }, toxins: { howManyPoints: 12 }
  };
  
  for(var gc in gcobs) {
    pcobs[gc] = {};
    
    var gcob = gcobs[gc], pcob = pcobs[gc], extra = cobExtras[gc];

    var callbackName = 'gather' + gc.substr(0, 1).toUpperCase() + gc.substr(1);
    var callback = this[callbackName];

    pcobs[gc].coblet = new A.Coblet(
      extra.howManyPoints, callback, this, gcob.valuesRangeLo, gcob.valuesRangeHi, gcob.decayRate
    );
    
    pcobs[gc].measurements = Array(extra.howManyPoints).fill(0);

    for(var gg in gcob) {
      var gene = gcob[gg];
      
      pcob[gg] = gene;
    }
  }
  
  pcobs.temperature.isEmergency = false;
};

A.Cobber.prototype = {
  currentAction: null,
  
  chooseAction: function() {
    var tempSignal_ = null, tempSignal = 0, actionSelected = false;
    
    if(!this.cobs.temperature.coblet.isEmpty) {
      tempSignal_ = this.cobs.temperature.coblet.getBestSignal(1);
      tempSignal = tempSignal_.weight * this.cobs.temperature.multiplier;
    }
    
    if(this.cobs.temperature.isEmergency || tempSignal > this.cobs.inertia.threshold * this.cobs.inertia.multiplier) {
      actionSelected = true;
      this.currentAction = { action: 'move', direction: tempSignal_.direction };
    }
    
    if(!actionSelected) { this.currentAction = this.encapsulateAction; }

    return this.currentAction;
  },

  gatherArchon: function(/*who*/) {
    return this.cobs.archon.measurements;
  },

  gatherFatigue: function() {
    return this.cobs.fatigue.measurements;
  },

  gatherHunger: function() {
    return this.cobs.hunger.measurements;
  },

  gatherInertia: function() {
    return this.cobs.inertia.measurements;
  },

  gatherFood: function(/*what*/) {
    return this.cobs.food.measurements;
  },
  
  gatherPredators: function() {
    return this.cobs.predators.measurements;
  },
  
  gatherPrey: function() {
    return this.cobs.prey.measurements;
  },
  
  gatherTemperature: function() {
    return this.cobs.temperature.measurements.slice();
  },

  gatherToxins: function() {
    return this.cobs.toxins.measurements;
  },
  
  launch: function() {
    
  },
  
  senseArchon: function(/*who*/) {
    
  },
  
  senseFatigue: function() {
    
  },
  
  senseHunger: function() {
    
  },
  
  senseInertia: function() {
    
  },
  
  senseFood: function(/*what*/) {
    
  },
  
  senseTemperature: function(temp, where) {
    var deltaFromOptimal = Math.abs(temp - this.archon.genome.optimalTemp);
    var rangeRadius = this.archon.genome.optimalTempRange / 2;
    
    this.cobs.temperature.isEmergency = deltaFromOptimal >= rangeRadius;

    this.cobs.temperature.measurements[where] = deltaFromOptimal;
  },
  
  senseToxins: function() {
    
  },
  
  tick: function() {
    for(var c in this.cobs) { var cob = this.cobs[c]; cob.coblet.tick(); }
  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Cobber;
}
