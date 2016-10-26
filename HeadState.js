/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

Archonia.Form.HeadState = function(head, position) {
  this.head = head;
  this.position = position;
  this.mannaOfInterest = Archonia.Form.XY();
  this.evade = Archonia.Form.XY();
  this.pursue = Archonia.Form.XY();
  this.theOtherGuy = Archonia.Form.XY();
  this.reset();
};

Archonia.Form.HeadState.prototype = {
  getAction: function() {
    var action = false;
    var foodSearchState = false;
    
    if(!action) { action = this.getTouchedArchonAction(); }
    if(!action) { action = this.getSensedArchonAction(); }
    if(!action) { action = this.getMannaGrabAction(); }

    if(!action) {
      action = this.getFoodSearchAction();
      
      if(this.foodSearchState) {
        if(this.frameCount > this.whenToIssueNextFoodSearchCommand) {
          this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
          // from here we'll fall through and send "food search"
        } else {
          // If we were already searching, wait a bit before updating
          action.action = "waitForCommand";
        }
      } else {
        // If we weren't already searching, tell head to restart
        action.action = "r" + action.action;
        this.whenToIssueNextFoodSearchCommand = this.frameCount + this.ticksBetweenFoodSearchCommands;
      }
      
      foodSearchState = true;
    }
    
    this.foodSearchState = foodSearchState;
    return action;
  },
  
  getFoodSearchAction: function() {
    var action = 0;
    
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdHorizontalOk) { action++; }
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdVerticalOnly) { action++; }
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdEncyst) { action++; }
    
    var netTemp = Math.abs(this.tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = this.hungerSignal * this.genome.hungerToleranceMultiplier;
    
    var result = { action: "foodSearch", where: "random" };
    if(netTemp > netHunger) {
      switch(action) {
        case 0: if(this.tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 1: if(this.tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
        case 2: { result = { action: "encyst" }; } break;
        case 3: { result = { action: "encyst" }; } break;
      }
    } else {
      switch(action) {
        case 0: result = { action: "foodSearch", where: "random" }; break;
        case 1: result = { action: "foodSearch", where: "random" }; break;
        case 2: if(this.tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 3: if(this.tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
      }
    }
    
    return result;
  },
  
  getMannaGrabAction: function() {
    if(this.mannaOfInterest.equals(0)) { return false; }
    else { return { action: "move", where: this.mannaOfInterest }; }
  },
  
  getSensedArchonAction: function() {
    if(this.evade.equals(0)) {
      if(this.pursue.equals(0)) {
        return false;
      } else {
        return { action: "move", where: Archonia.Form.XY(this.pursue) };
      }
    } else {
      return { action: "move", where: Archonia.Form.XY(this.evade) };
    }
  },
  
  getTouchedArchonAction: function() {
    if(this.theOtherGuy.equals(0)) { return false; }
    else { return { action: "stop" }; }
  },
  
  getTween: function() { return this.tween; },
  
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
    this.tempSignal = 0;
    this.hungerSignal = 0;
    this.eatingOtherArchon = false;
    this.beingEaten = false;
    this.manna = [];
    this.sensedArchons = [];
    this.touchedArchons = [];
    this.mannaOfInterest.reset();
    this.evade.reset();
    this.pursue.reset();
    this.theOtherGuy.reset();
    
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
    
    this.senseTemp();   // The spatial senses are driven externally
    this.senseHunger(); // we have to drive these ourselves
    
    this.updateNonSpatialSenses();
    this.updateMannaTargets();
    this.updateSensedArchonTargets(currentMass);
    this.updateTouchedArchons(currentMass);
    this.updateTween();
    this.manna = [];
    this.sensedArchons = [];
    this.touchedArchons = [];
    this.tweenStage = false;
    this.firstTickAfterLaunch = false;
  },
  
  touchOtherArchon: function(otherArchon) { this.touchedArchons.push(otherArchon); },
  
  updateMannaTargets: function() {
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
    
    if(closestManna.equals(0)) { this.mannaOfInterest.reset(); }
    else { this.mannaOfInterest.set(closestManna); }
  },
  
  updateNonSpatialSenses: function() {
    this.tempSignal = this.tempInput.getSignalStrength();
    this.hungerSignal = this.hungerInput.getSignalStrength();
  },
  
  updateSensedArchonTargets: function(myMass) {
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
      
    this.evade.reset(); this.pursue.reset();
    if(action === "evade") {
      var a = this.position.getAngleFrom(closestArchon);
      var d = Archonia.Form.XY().setPolar(25, a).plus(this.position); d.floor();

      this.evade.set(d);
    } else if(action === "pursue") {
      this.pursue.set(closestArchon);
    }
  },
  
  updateTouchedArchons: function(myMass) {
    var theOtherGuy = Archonia.Form.XY();
    
    for(var i = 0; i < this.touchedArchons.length; i++) {
      var checkArchon = this.touchedArchons[i];
      var hisMass = checkArchon.goo.getMass();
      var hisPosition = checkArchon.position;
      
      if(hisPosition.equals(this.theOtherGuy)) {
        theOtherGuy.set(this.theOtherGuy);
        break;
      } else {
        theOtherGuy.set(hisPosition);
        
        var iAmThePoisoner = this.genome.toxinStrength > checkArchon.genome.toxinResistance;
        var iAmThePoisoned = checkArchon.genome.toxinStrength > this.genome.toxinResistance;

        var iAmThePredator = myMass * this.genome.predationRatio > hisMass;
        var iAmThePrey = hisMass * checkArchon.genome.predationRatio > myMass;

        if(iAmThePredator) {
          if(iAmThePoisoned) { this.tweenStage = "poisoned"; }
        } else if(iAmThePrey) {
          if(!iAmThePoisoner) { this.tweenStage = "eaten"; }
        }
      }
    }
    
    if(theOtherGuy.equals(0)) { this.theOtherGuy.reset(); }
    else { this.theOtherGuy.set(theOtherGuy); }
  },
  
  updateTween: function() { this.tween = this.tweenStage; }
};

})(Archonia);
