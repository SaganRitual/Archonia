/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var overrideSignalBufferSize = 30;
  var howManyTicksBetweenMoves_ = 60;
  
var Gnatfly = function(archon, howManyTicksBetweenMoves) {
  if(howManyTicksBetweenMoves === undefined) { howManyTicksBetweenMoves = howManyTicksBetweenMoves_; }
  
  this.state = archon.state;
  this.genome = archon.genome;
  this.howManyTicksBetweenMoves = howManyTicksBetweenMoves;
  
  this.lastPosition = Archonia.Form.XY();
  this.grid = new Archonia.Form.Grid(this.state.position);
};

Gnatfly.prototype = {
  chooseTargetPosition: function(signalCurve) {
    var w = this.grid.getCurveWeight(signalCurve);
    var r = Archonia.Axioms.integerInRange(0, w);
    var s = this.weightedSelect(signalCurve, r);
    
    return s;
  },
  
  weightedSelect: function(signalCurve, randomValue) {
    var c = null, d = null, f = null, i = null;

    f = signalCurve.find(function(e) { return e !== null && e > 0; });

    if(f === undefined) {
      // If all we have are nulls and zeros, put 1s wherever
      // we have zeros, to make all of them equally likely and
      // so we won't just go through the zeros and always pick 7
      for(i = 0; i < signalCurve.length; i++) { if(signalCurve[i] === 0) { signalCurve[i] = 1; } }
    }
    
    // Now check whether we're in danger of going out of bounds
    for(i = 0, c = 0; i < signalCurve.length; i++) { if(signalCurve[i] !== null) { c++; } }

    if(c <= 3) {
      // We're too close to a boundary; choose the direction that
      // gets us back in bounds. Easy enough: set everything else
      // to zero and return the ix of the one that had the highest
      // signal
      for(i = 0, c = null; i < signalCurve.length; i++) {
        if(signalCurve[i] !== null) {
          if(c === null || signalCurve[i] > c) { c = signalCurve[i]; d = i; }
        }
      }
      
      for(i = 0; i < signalCurve.length; i++) { signalCurve[i] = 0; }

      signalCurve[d] = 1; // No randomness; take this one
      return d;
      
    } else {
    
      for(i = 0; i < signalCurve.length && randomValue >= 0; i++) {
        randomValue -= signalCurve[i];
      }

      return i - 1;
    }
  },
  
  launchToNextPosition: function(signalCurve) {
    var where = this.chooseTargetPosition(signalCurve);

    var r = Archonia.Form.XY(), s = Archonia.Form.XY();
    r.set(Archonia.Essence.gridPositions[where].plus(this.state.position));
    s.set(r);
    
    // Just so they don't go around in straight lines all the time
    r = s.randomizedTo(Archonia.Essence.gridletSize); if(!s.isInBounds()) { r.set(s); }
    this.state.targetPosition.set(r);
    this.lastPosition.set(this.state.position);
  },
  
  launch: function() {
    var i = null, lo = null, hi = null;
  
    lo = this.genome.optimalTempLo - this.genome.tempRadius; hi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.tempSensors = [];
    for(i = 0; i < 8; i++) {
      this.tempSensors.push(new Archonia.Form.SignalSmoother(overrideSignalBufferSize, this.genome.tempSignalDecayRate, lo, hi));
    }

    lo = this.genome.reproductionThreshold - this.genome.birthMassAdultCalories; hi = 0;
  
    this.state.hungerSensor = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.hungerSignalBufferSize), this.genome.hungerSignalDecayRate, lo, hi
    );
  
    lo = 0; hi = Archonia.gameWidth;
    this.pollenSensors = [];
    for(i = 0; i < 8; i++) {
      this.pollenSensors.push(new Archonia.Form.SignalSmoother(
        Math.floor(this.genome.pollenSignalBufferSize), this.genome.pollenSignalDecayRate, lo, hi));
    }
    
    this.lastPosition.set(this.state.position);
  },
  
  tick: function() {
    if(this.state.firstTickAfterLaunch) {
      this.whenToIssueNextMove = 0;
    }

    if(this.state.frameCount > this.whenToIssueNextMove) {
      var signalCurve = this.grid.getSignalCurve();
      this.launchToNextPosition(signalCurve);
      this.whenToIssueNextMove = this.state.frameCount + this.howManyTicksBetweenMoves;
    }
  }
};

Archonia.Form.Gnatfly = Gnatfly;

})(Archonia);
