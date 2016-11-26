/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Senses = function(archon) {
  this.genome = archon.genome;
  this.state = archon.state;
};

Senses.prototype = {
  launch: function() {
    var lo = null, hi = null;
  
    lo = this.genome.optimalTempLo - this.genome.tempRadius;
    hi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.state.tempInput = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.tempSignalBufferSize), this.genome.tempSignalDecayRate, lo, hi
    );
  
    lo = this.genome.reproductionThreshold - this.genome.birthMassAdultCalories;
    hi = 0;

    this.state.hungerInput = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.hungerSignalBufferSize), this.genome.hungerSignalDecayRate, lo, hi
    );

    this.reset();
  },
  
  reset: function() {
    this.resetSpatialInputs();
    
    this.state.tempInput.reset();
    this.state.hungerInput.reset();
  },
  
  resetSpatialInputs: function() {
    this.sensedManna = [];
  },
  
  senseHunger: function() { this.state.hungerInput.store(this.state.embryoCalorieBudget); },
  senseManna: function(manna) { if(this.sensedManna.length === 0) { this.sensedManna.push(manna); } },
  senseTemp: function() {
    this.state.tempInput.store(Archonia.Cosmos.TheAtmosphere.getTemperature(this.state.position) - this.genome.optimalTemp);
  },
  
  tick: function() { this.transferSpatialInputs(); this.senseTemp(); this.senseHunger(); },
  
  transferSpatialInputs: function() {
    this.state.sensedManna = this.sensedManna.slice(0);
    
    this.resetSpatialInputs();
  }
};

Archonia.Form.Senses = Senses;

})(Archonia);
