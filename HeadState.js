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
  this.theOtherGuy = Archonia.Form.XY();
  this.reset();
};

Archonia.Form.HeadState.prototype = {
  computeFoodSearchState: function() {
    this.senseHunger(); this.senseTemp();

    var tempSignal = this.tempInput.getSignalStrength();
    var hungerSignal = this.hungerInput.getSignalStrength();
    var action = 0;
    
    if(Math.abs(tempSignal) > this.genome.tempThresholdHorizontalOk) { action++; }
    if(Math.abs(tempSignal) > this.genome.tempThresholdVerticalOnly) { action++; }
    if(Math.abs(tempSignal) > this.genome.tempThresholdEncyst) { action++; }
    
    var netTemp = Math.abs(tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.genome.hungerToleranceMultiplier;
    
    var result = { action: "foodSearch", where: "random" };
    if(netTemp > netHunger) {
      switch(action) {
        case 0: if(tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 1: if(tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
        case 2: { result = { action: "encyst" }; } break;
        case 3: { result = { action: "encyst" }; } break;
      }
    } else {
      switch(action) {
        case 0: result = { action: "foodSearch", where: "random" }; break;
        case 1: result = { action: "foodSearch", where: "random" }; break;
        case 2: if(tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 3: if(tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
      }
    }
    
    this.foodSearchState = result;
  },
  
  computeHeadState: function() {
    var state = this.headState; state.action = "waitForCommand";
    var stateSet = false;
    
    if(!stateSet && this.touchedArchonState) {
      if(state.current !== "touchedArchonState") { state.action = "stop"; }
      
      if(this.touchedArchonState.newOtherGuy) { state.tween = this.touchedArchonState.tween; }
      else { state.tween = false; }
      
      state.current = "touchedArchonState"; stateSet = true;
    } else if(state.current === "touchedArchonState") {
      // we went from being touched to not being touched; being touched causes
      // a tween to run; when we leave the touched state we need to stop it
      state.tween = "stop";
    }
    
    if(!stateSet && this.sensedArchonState) {
      state.current = "sensedArchonState";
      state.action = this.sensedArchonState.action;
      state.where = this.sensedArchonState.where;
      stateSet = true;
    }
    
    if(!stateSet && this.mannaGrabState) {
      state.current = "mannaGrabState";
      state.action = this.mannaGrabState.action;
      state.where = this.mannaGrabState.where;
      stateSet = true;
    }
    
    if(!stateSet && this.foodSearchState.action === "encyst") {
      if(state.current === "encysted") {
        // We were already encysted
        if(state.tween === "stop") { state.tween = "encyst"; }
        else { state.tween = false; }
      } else {
        // We're just now encysting; if there are any other
        // tweens running, we need to stop them. Otherwise,
        // start the encystment tween
        if(state.tween) { state.tween = "stop"; }
        else { state.tween = "encyst"; }

        state.action = "stop";
      }

      state.current = "encysted";
      stateSet = true;
    }
    
    if(!stateSet && this.foodSearchState.action === "foodSearch") {
      if(state.current === "foodSearch") {
        if(this.frameCount > this.whenToIssueNextFoodSearchCommand) {
          this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
          state.action = "foodSearch"; state.where = this.foodSearchState.where;
        } else {
          // If we were already searching, wait a bit before updating
          state.action = "waitForCommand";
        }
        state.tween = false;
      } else {
        // If we weren't already searching, tell head to restart
        state.action = "r" + state.action;
        this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
        state.tween = "stop";
      }

      state.current = "foodSearch";
      stateSet = true;
    }
  },
  
  computeMannaGrabState: function() {
    var closestManna = Archonia.Form.XY();

    for(var i = 0; i < this.manna.length; i++) {
      var checkManna = Archonia.Form.XY(this.manna[i]);
      
      if(checkManna.equals(this.mannaOfInterest)) {
        closestManna.set(this.mannaOfInterest); // If we're already targeting, stay the course
        break;
      } else {
        if(checkManna.getDistanceTo(this.position) < closestManna.getDistanceTo(this.position)) {
          closestManna.set(checkManna);
        }
      }
    }
    
    var result = {};
    
    if(closestManna.equals(0)) { this.mannaOfInterest.reset(); result = false; }
    else { this.mannaOfInterest.set(closestManna); result = { action: "move", where: closestManna }; }
    
    this.mannaGrabState = result;
    this.manna = [];
  },
  
  computeSensedArchonState: function(myMass) {
    var closestArchon = Archonia.Form.XY();
    var action = null;
    
    if(this.evade.equals(0)) {
      if(!this.pursue.equals(0)) {
        closestArchon.set(this.pursue);
      }
    } else {
      closestArchon.set(this.evade);
    }

    for(var i = 0; i < this.sensedArchons.length; i++) {
      var checkArchon = this.sensedArchons[i];
      var hisMass = checkArchon.goo.getMass();
      var hisPosition = checkArchon.position;
      
      if((hisPosition.equals(this.evade)) || hisMass * this.genome.predatorFearRatio > myMass) {
        closestArchon.set(hisPosition);
        action = "evade";
        break;
      } else {
        if(myMass * this.genome.predationRatio > hisMass) {
          action = "pursue";
          
          if(hisPosition.equals(this.pursue)) {
            closestArchon.set(this.pursue); // If we're already targeting, stay the course
            break;
          } else {
            if(hisPosition.getDistanceTo(this.position) < closestArchon.getDistanceTo(this.position)) {
              closestArchon.set(hisPosition);
            }
          }
        }
      }
    }

    var result = {};
    
    this.evade.reset(); this.pursue.reset();

    if(action === "evade") {
      var a = this.position.getAngleFrom(closestArchon);
      var d = Archonia.Form.XY().setPolar(25, a).plus(this.position); d.floor();

      this.evade.set(d);
      result = { action: "move", where: Archonia.Form.XY(this.evade) };

    } else if(action === "pursue") {
      this.pursue.set(closestArchon);
      result = { action: "move", where: Archonia.Form.XY(this.pursue) };
    } else {
      result = false;
    }
    
    this.sensedArchonState = result;
    this.sensedArchons = [];
  },
  
  computeTouchedArchonState: function(myMass) {
    var theOtherGuy = Archonia.Form.XY();
    var result = {};
    
    for(var i = 0; i < this.touchedArchons.length; i++) {
      var checkArchon = this.touchedArchons[i];
      var hisMass = checkArchon.goo.getMass();
      var hisPosition = checkArchon.position;
      
      if(hisPosition.equals(this.theOtherGuy)) {
        result.newOtherGuy = false;
        theOtherGuy.set(this.theOtherGuy);
        break;
      } else {
        result.newOtherGuy = true;
        theOtherGuy.set(hisPosition);
        
        var iAmThePoisoner = this.genome.toxinStrength > checkArchon.genome.toxinResistance;
        var iAmThePoisoned = checkArchon.genome.toxinStrength > this.genome.toxinResistance;

        var iAmThePredator = myMass * this.genome.predationRatio > hisMass;
        var iAmThePrey = hisMass * checkArchon.genome.predationRatio > myMass;

        if(iAmThePredator) {
          if(iAmThePoisoned) { result.tween = "poisoned"; }
        } else if(iAmThePrey) {
          if(!iAmThePoisoner) { result.tween = "eaten"; }
        }
      }
    }
    
    if(theOtherGuy.equals(0)) { result = false; }
    else { result.theOtherGuy = theOtherGuy; result.action = "stop"; }

    this.touchedArchonState = result;
    this.touchedArchons = [];
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
  
  reset: function() {
    this.firstTickAfterLaunch = true;
    this.eatingOtherArchon = false;
    this.beingEaten = false;
    this.manna = [];
    this.sensedArchons = [];
    this.touchedArchons = [];
    this.mannaOfInterest.reset();
    this.evade.reset();
    this.pursue.reset();
    this.theOtherGuy.reset();
    
    this.foodSearchState = { encysted: false };
    this.touchedArchonState = {};
    this.sensedArchonState = {};
    this.mannaGrabState = {};
    this.headState = { action: "waitForCommand", tween: false };
    
    this.tweenStage = "birth";
    this.tween = false;
  },
  
  senseManna: function(manna) { this.manna.push(manna); },

  senseOtherArchon: function(otherArchon) {
    // Don't count myself
    if(this.head.archon.archoniaUniqueId !== otherArchon.archoniaUniqueId) {
      this.sensedArchons.push(otherArchon);
    }
  },

  senseHunger: function() { this.hungerInput.store(this.head.archon.goo.embryoCalorieBudget); },
  senseTemp: function() {
    this.tempInput.store(Archonia.Cosmos.Sun.getTemperature(this.position) - this.genome.optimalTemp);
  },
  
  tick: function(frameCount, currentMass) {
    this.frameCount = frameCount;
    
    this.computeFoodSearchState();
    this.computeMannaGrabState();
    this.computeSensedArchonState(currentMass);
    this.computeTouchedArchonState(currentMass);
    this.computeHeadState();
    
    this.firstTickAfterLaunch = false;
  },
  
  touchOtherArchon: function(otherArchon) { this.touchedArchons.push(otherArchon); },
};

})(Archonia);
