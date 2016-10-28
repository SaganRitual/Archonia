/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.HeadState = function(head, position) {
  this.head = head;
  this.headState = {};
  this.position = position;
  this.mannaOfInterest = Archonia.Form.XY();
  this.evade = Archonia.Form.XY();
  this.pursue = Archonia.Form.XY();
  this.touchState = new Archonia.Form.TouchState(this);
  this.encystmentState = new Archonia.Form.EncystmentState(this);
  this.senseArchonState = new Archonia.Form.SenseArchonState(this);
  this.senseMannaState = new Archonia.Form.SenseMannaState(this);
  this.foodSearchState = new Archonia.Form.FoodSearchState(this);
  this.reset();
};

Archonia.Form.HeadState.prototype = {
  computeHeadState: function() {
    var state = this.headState;
    var stateSet = false;
    
    if(!stateSet) {
      if(this.encystmentState.newState) {
        state.action = this.encystmentState.action;
        state.tween = this.encystmentState.tween;
        stateSet = true;
      } else if(this.encystmentState.active) {
        state.action = "waitForCommand";
        state.tween = false;
        stateSet = true;
      } else {
        state.tween = "stop";
      }
    }
    
    if(!stateSet) {
      if(this.touchState.newState) {
        state.action = this.touchState.action;
        state.tween = this.touchState.tween;
        stateSet = true;
      } else if(this.touchState.active) {
        state.action = "waitForCommand";
        state.tween = false;
        stateSet = true;
      } else {
        state.tween = "stop";
      }
    }
    
    if(!stateSet && this.senseArchonState.active) {
      state.action = this.senseArchonState.action;
      state.where = this.senseArchonState.where;
      stateSet = true;
    }
    
    if(!stateSet && this.senseMannaState.active) {
      state.action = this.senseMannaState.action;
      state.where = this.senseMannaState.where;
      stateSet = true;
    }
    
    if(stateSet) {
      this.foodSearchState.active = false;
    } else {
      if(this.foodSearchState.active) {
        if(this.frameCount > this.whenToIssueNextFoodSearchCommand) {
          this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
          state.action = "foodSearch"; state.where = this.foodSearchState.where;
        } else {
          // If we were already searching, wait a bit before updating
          state.action = "waitForCommand";
        }
      } else {
        // If we weren't already searching, tell head to restart
        this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
        state.action = "rFoodSearch"; state.where = this.foodSearchState.where;
        this.foodSearchState.active = true;
      }
    }
    
    if(this.firstTickAfterLaunch) {
      if(state.tween === false) { state.tween = "birth"; }
    } else {
      if(state.tween === "birth") { state.tween = false; }
    }
  },
  
  getAction: function() {
    return { action: this.headState.action, where: this.headState.where };
  },
  
  getTween: function() { return this.headState.tween; },
  
  launch: function(genome) {
    this.genome = genome;
    this.reset();
    
    this.ticksBetweenFoodSearchCommands = 60;
    this.whenToIssueNextFoodSearchCommand = 0;
    
    this.tempSignalScaleLo = this.genome.optimalTempLo - this.genome.tempRadius;
    this.tempSignalScaleHi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.tempInput = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.tempSignalBufferSize), this.genome.tempSignalDecayRate,
      this.tempSignalScaleLo, this.tempSignalScaleHi
    );
    
    this.hungerSignalScaleLo = this.genome.reproductionThreshold - this.genome.birthMassAdultCalories;
    this.hungerSignalScaleHi = 0;

    this.hungerInput = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.hungerSignalBufferSize), this.genome.hungerSignalDecayRate,
      this.hungerSignalScaleLo, this.hungerSignalScaleHi
    );
  },
  
  report: function() {
    console.log("encystmentState", this.encystmentState);
    console.log("foodSearchState", this.foodSearchState);
    console.log("mannaGrabState", this.mannaGrabState);
    console.log("sensedArchonState", this.sensedArchonState);
    console.log("touchState", this.touchState);
    console.log("headState", this.headState);
  },
  
  reset: function() {
    this.firstTickAfterLaunch = true;
    this.headState = { action: "waitForCommand", tween: "birth" };
  },

  senseHunger: function() { this.hungerInput.store(this.head.archon.goo.embryoCalorieBudget); },
  senseTemp: function() {
    this.tempInput.store(Archonia.Cosmos.Sun.getTemperature(this.position) - this.genome.optimalTemp);
  },
  
  tick: function(frameCount, currentMass) {
    this.frameCount = frameCount;
    
    this.senseHunger();
    this.senseTemp();

    this.encystmentState.tick(this.tempInput.getSignalStrength(), this.hungerInput.getSignalStrength());
    this.touchState.tick(currentMass);
    this.senseArchonState.tick(currentMass);
    this.senseMannaState.tick();
    this.foodSearchState.tick();
    
    this.computeHeadState();
    
    this.firstTickAfterLaunch = false;
  },

  tooCloselyRelated: function(me, theOtherGuy) {
    var r = Archonia.Cosmos.familyTree.getDegreeOfRelatedness(
      me.archoniaUniqueObjectId, theOtherGuy.archoniaUniqueObjectId
    );
    
    // Self is 0, parent/child is 1, siblings are 2; everyone else is fair game
    return r <= 0;
  }

};

})(Archonia);
