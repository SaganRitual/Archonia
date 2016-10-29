/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.HeadState = function(head, position) {
  this.head = head;
  this.headState = { currentStatelet: "" };
  this.position = position;
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
        this.tweens.push(this.encystmentState.tween);
        state.currentStatelet = "encystmentState";
        stateSet = true;
      } else if(this.encystmentState.active) {
        state.action = "waitForCommand";
        state.currentStatelet = "encystmentState";
        stateSet = true;
      } else if(state.currentStatelet === "encystmentState") {
        this.tweens.push("stop");
      }
    }
    
    if(!stateSet) {
      if(this.touchState.newState) {
        state.action = this.touchState.action;
        this.tweens.push(this.touchState.tween);
        state.currentStatelet = "touchState";
        stateSet = true;
      } else if(this.touchState.active) {
        state.action = "waitForCommand";
        state.currentStatelet = "touchState";
        stateSet = true;
      } else if(state.currentStatelet === "touchState") {
        this.tweens.push("stop");
      }
    }
    
    if(!stateSet && this.senseMannaState.active) {
      state.action = this.senseMannaState.action;
      state.where = this.senseMannaState.where;
      stateSet = true;

      state.currentStatelet = "senseMannaState";
    }
    
    if(!stateSet && this.senseArchonState.active) {
      state.action = this.senseArchonState.action;
      state.where = this.senseArchonState.where;
      stateSet = true;

      state.currentStatelet = "senseArchonState";
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
      
      state.currentStatelet = "foodSearchState";
    }

    if(this.tweens.length) {
      var tween = this.tweens.shift();
      if(tween === "stop") {
        this.head.archon.stopTween();
      } else if(tween) {
        this.head.archon.startTween(tween);
      }
    }
  },
  
  getAction: function() {
    var action = { action: this.headState.action, where: this.headState.where };
    return action;
  },
  
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
  
  reset: function() {
    this.firstTickAfterLaunch = true;
    this.tweens = [ "stop", "birth" ];
    this.headState = { currentStatelet: "", action: "waitForCommand" };
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
    
    // Self is 0
    // parent/child is 1
    // grandparent/grandchild, sibling -- 2
    // sibling of parent or child of sibling (uncle/nephew) -- 3
    // children of parent's siblings (immediate cousin), g-grandparent/child, siblings of grandparent -- 4
    // 5 is way the hell out there, 2nd cousins, great-uncles & stuff
    return r <= 5;
  }

};

})(Archonia);
