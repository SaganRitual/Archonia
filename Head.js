/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var squareSize = 30;
  var relativePositions = [
    Archonia.Form.XY(0, -squareSize), Archonia.Form.XY(squareSize, -squareSize), Archonia.Form.XY(squareSize, 0),
    Archonia.Form.XY(squareSize, squareSize), Archonia.Form.XY(0, squareSize), Archonia.Form.XY(-squareSize, squareSize),
    Archonia.Form.XY(-squareSize, 0), Archonia.Form.XY(-squareSize, -squareSize)
  ];

Archonia.Form.Head = function(archon) {
  this.archon = archon;
  this.whenToIssueNextMoveOrder = 0;
  
  this.previousMoveTarget = Archonia.Form.XY();
  this.currentFoodTarget =  Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);

  this.handlingBadWeather = false;
};

Archonia.Form.Head.prototype = {
  
  checkBadWeather: function() {
    var moveChoices = [], i = null, p = null;
    
    var tempTop = Archonia.Cosmos.Sun.getTemperature(relativePositions[0].plus(this.position));
    var tempBottom = Archonia.Cosmos.Sun.getTemperature(relativePositions[4].plus(this.position));
    
    var tooHot = tempBottom > this.genome.optimalTempHi;
    var tooCold = tempTop < this.genome.optimalTempLo;
    
    if(tooHot) { this.temps.store(Math.abs(tempBottom - this.genome.optimalTemp)); }
    else if(tooCold) { this.temps.store(Math.abs(tempTop - this.genome.optimalTemp)); }
    else { this.temps.store(0); }
    
    var s = this.temps.getSignalStrength();
    if(s > 0.85) { this.handlingBadWeather = true; }
    else if(s < 0.25) { this.handlingBadWeather = false; }
    
    if(this.handlingBadWeather) {
      this.archon.encyst();
    } else {
      this.archon.unencyst();
      
      if((tooHot || tooCold) && this.frameCount > this.whenToIssueNextMoveOrder) {
        if(tooHot) {
          moveChoices.push(3); moveChoices.push(4); moveChoices.push(5);
        } else {
          moveChoices.push(0); moveChoices.push(1); moveChoices.push(7);
        }

        i = Archonia.Axioms.integerInRange(0, moveChoices.length);
        p = relativePositions[moveChoices[i]].plus(this.position);

        this.legs.setTargetPosition(p);
    
        this.whenToIssueNextMoveOrder = this.frameCount + this.howLongBetweenMoves;
      }
    }
    
    // If we're just moving away from bad weather, tooHot or tooCold
    // will be set, and the big flag will not. On the other hand, if
    // we're waiting for the signal average to go down, tooHot/tooCold
    // won't be set, so we'll depend on the big flag. Returning all
    // of this to tell the tick that we've made the decision about
    // where to move, so he won't pass the decision on to the main
    // moving funciton.
    return this.handlingBadWeather || tooHot || tooCold;
  },
    
  clearFoodGrab: function() {
    if(this.foodGrab) {
      // Wait a bit before starting the search again; a bit of
      // drifting in the general area of the food we just
      // ate might get us closer to more
      this.legs.drift();
      this.foodGrab = false;
      this.whenToIssueNextMoveOrder = this.frameCount + this.howLongBetweenMoves * 2;
    }
  },

  doubleBack: function() {
    var safePoint = null;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, point) {
        var temp = Archonia.Cosmos.Sun.getTemperature(point);

        if(temp < this.genome.optimalTempHi && temp > this.genome.optimalTempLo) {
          safePoint = Archonia.Form.XY(point);
          return false;
        }
      }, this);
    }
    
    return safePoint;
  },
  
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }
    
    return weRememberIt;
  },
  
  drawMemory: function() {
    var drawDebugLines = false;
    
    if(drawDebugLines) {
      var p1 = Archonia.Form.XY(), p2 = Archonia.Form.XY();
    
      if(!this.trail.isEmpty()) {
        var hue = 0;
        this.trail.forEach(function(ix, value) {
          var color = 'hsl(' + hue + ', 100%, 50%)';
          
          p1.set(value.plus(-squareSize / 2, -squareSize / 2));
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
        
          p2.set(value.plus(-squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);

          p1.set(value.plus(squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p2, p1, color);
        
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
          
          hue += 30;
        });
      }
    }
    
  },
  
  launch: function(genome, legs, position) {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;

    this.genome = genome;
    this.legs = legs;
    this.position = position;

    this.howLongBetweenMoves = 2 * this.genome.maxMVelocity;

    this.temps = new Archonia.Form.SignalSmoother(
      10, 0.02, this.genome.optimalTemp, this.genome.optimalTemp + (this.genome.tempRange * 0.75)
    );
  },
  
  move: function() {
    var bestChoices = [], i = null, p = null;
    
    if(this.previousMoveTarget.equals(0)) { this.previousMoveTarget.set(this.position); }
    
    for(i = 0; i < 8; i++) {
      p = relativePositions[i].plus(this.previousMoveTarget);
      
      if(p.isInBounds() && !this.doWeRemember(p)) { bestChoices.push(p); }
    }
    
    if(bestChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, bestChoices.length);
      p = bestChoices[i];
    } else {
      p = this.doubleBack();
      if(p === null) { console.log("encyst"); this.trail.reset();  this.archon.encyst(); return;}
    }
    
    this.whenToIssueNextMoveOrder = this.frameCount + this.howLongBetweenMoves;
    
    // This is where we're aiming; remember it so when we come back
    // into the move function, we can calculate our next move based on
    // where we intended to be, rather than where the legs might have put
    // us -- the legs don't typically get us to the specific target
    this.previousMoveTarget.set(p);
    
    this.legs.setTargetPosition(p);
    
    this.trail.store(p);
  },
  
  setFoodGrab: function() {
    if(!this.foodGrab) {
      if(!this.trail.isEmpty()) { this.trail.reset(); }
      this.previousMoveTarget.reset();
      this.foodGrab = true;
    }
  },
  
  tick: function(frameCount, foodTarget) {
    this.frameCount = frameCount;
    
    this.drawMemory();
    
    var badWeather = this.checkBadWeather();
    
    if(!badWeather) {
      if(foodTarget.equals(0)) {
        this.clearFoodGrab();
      
        if(this.frameCount > this.whenToIssueNextMoveOrder) { this.move(); } 
      } else {
        var drawDebugLines = false;
        if(drawDebugLines) {
          Archonia.Essence.Dbitmap.aLine(this.position, foodTarget, 'red');
        }
      
        this.setFoodGrab();

        if(!this.currentFoodTarget.equals(foodTarget)) {
          this.currentFoodTarget.set(foodTarget);
          this.legs.setTargetPosition(this.currentFoodTarget, 0, 0);
        }
      }
    
      this.currentFoodTarget.set(foodTarget);
    }
    
  },
};

})(Archonia);
