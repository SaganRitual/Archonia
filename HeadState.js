/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

Archonia.Form.HeadState = function(position) {
  this.position = position;
  this.mannaOfInterest = Archonia.Form.XY();
  this.evade = Archonia.Form.XY();
  this.pursue = Archonia.Form.XY();
  this.theOtherGuy = Archonia.Form.XY();
  this.reset();
};

Archonia.Form.HeadState.prototype = {
  getAction: function() {
    var touchedArchonAction = this.getTouchedArchonAction();
    if(touchedArchonAction === false) {

      var sensedArchonAction = this.getSensedArchonAction();
      if(sensedArchonAction === false) {

        var mannaGrabAction = this.getMannaGrabAction();
        if(mannaGrabAction === false) {
          return this.getFoodSearchAction();
        } else {
          return mannaGrabAction;
        }
      } else {
        return sensedArchonAction;
      }
    } else {
      return touchedArchonAction;
    }
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
  senseOtherArchon: function(otherArchon) { this.sensedArchons.push(otherArchon); },
  setHungerSignal: function(signal) { this.hungerSignal = signal; },
  setTempSignal: function(signal) { this.tempSignal = signal; },
  
  tick: function(currentMass) {
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
  
  updateSensedArchonTargets: function(currentMass) {
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
      
      if((checkArchon.equals(this.evade)) ||
          checkArchon.getMass() * this.genome.predatorFearRatio > currentMass) {
        closestArchon.set(checkArchon);
        action = "evade";
        break;
      } else {
        if(currentMass * this.genome.predationRatio > checkArchon.getMass()) {
          action = "pursue";
          
          if(checkArchon.equals(this.pursue)) {
            closestArchon.set(this.pursue); // If we're already targeting, stay the course
            break;
          } else {
            if(checkArchon.getDistanceTo(this.position) < closestArchon.getDistanceTo(this.position)) {
              closestArchon.set(checkArchon);
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
  
  updateMannaTargets: function() {
    var closestManna = Archonia.Form.XY();

    for(var i = 0; i < this.manna.length; i++) {
      var checkManna = this.manna[i];
      
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
  
  updateTouchedArchons: function(currentMass) {
    var theOtherGuy = Archonia.Form.XY();
    
    for(var i = 0; i < this.touchedArchons.length; i++) {
      var checkArchon = this.touchedArchons[i];
      
      if(checkArchon.equals(this.theOtherGuy)) {
        theOtherGuy.set(this.theOtherGuy);
        break;
      } else {
        theOtherGuy.set(checkArchon);
        
        var iAmThePoisoner = this.genome.toxinStrength > checkArchon.genome.toxinResistance;
        var iAmThePoisoned = checkArchon.genome.toxinStrength > this.genome.toxinResistance;

        var iAmThePredator = currentMass * this.genome.predationRatio > checkArchon.getMass();
        var iAmThePrey = checkArchon.getMass() * checkArchon.genome.predationRatio > currentMass;

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
