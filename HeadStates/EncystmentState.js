/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

Archonia.Form.EncystmentState = function(headState) {
  this.headState = headState;
  this.active = false;
  this.newState = false;
  this.tween = null;
  this.encysted = false;
};

Archonia.Form.EncystmentState.prototype = {
  computeEncystmentState: function(tempSignal) {
    var thresholdEncyst = Math.abs(tempSignal) > this.headState.head.archon.genome.tempThresholdEncyst;
    var thresholdUnencyst = Math.abs(tempSignal) < this.headState.head.archon.genome.tempThresholdUnencyst;
    
    if(thresholdEncyst) {
      this.active = true;
      this.newState = !this.encysted;
      this.action = "stop";
      this.tween = "encyst";

      this.encysted = true;
    } else if(thresholdUnencyst) {
      this.active = this.encysted;
      this.newState = this.encysted;
      this.action = "stop"; // stop is ok here, we're going inactive, so head state will update on next tick
      this.tween = "stop";
      
      this.encysted = false;
    } else {
      this.active = this.encysted;
      this.newState = false;
      this.action = "stop";
      this.tween = "encyst";
    }
  },
  
  tick: function(tempSignal/*, hungerSignal*/) {
    this.computeEncystmentState(tempSignal);
  }
};
