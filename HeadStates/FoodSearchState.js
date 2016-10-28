/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.FoodSearchState = function(headState) {
  this.headState = headState;
  
  this.action = null;
  this.where = null;
  this.whereIsh = Archonia.Form.XY();
};

Archonia.Form.FoodSearchState.prototype = {
  computeFoodSearchState: function() {
    var tempSignal = this.headState.senseTemp();
    var hungerSignal = this.headState.senseHunger();
    var action = 0;
    
    if(Math.abs(tempSignal) > this.headState.head.archon.genome.tempThresholdHorizontalOk) { action++; }
    if(Math.abs(tempSignal) > this.headState.head.archon.genome.tempThresholdVerticalOnly) { action++; }
    
    var netTemp = Math.abs(tempSignal) * this.headState.head.archon.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.headState.head.archon.genome.hungerToleranceMultiplier;
    
    var result = { action: "foodSearch", where: "random" };
    if(netTemp > netHunger) {
      switch(action) {
        case 0: if(tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        
        case 1:
        case 2: if(tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
      }
    } else {
      switch(action) {
        case 0: result = { action: "foodSearch", where: "random" }; break;
        case 1: if(tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 2: if(tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
      }
    }
    
    this.foodSearchState = result;
  },
  
  tick: function() {
    this.computeFoodSearchState();
  } 
};

})(Archonia);