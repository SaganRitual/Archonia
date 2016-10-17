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

Archonia.Form.Head = function() {
  this.whenToIssueNextMoveOrder = 0;
  
  this.previousMoveTarget = Archonia.Form.XY();
  this.currentFoodTarget =  Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
};

Archonia.Form.Head.prototype = {
  // jshint bitwise: false
  allFlagsOn: function(whichField, whichFlags) { return (this[whichField] & whichFlags)  === whichFlags; },
  anyFlagsOn: function(whichField, whichFlags) { return (this[whichField] & whichFlags) !== 0; },
  clearFlags: function(whichField, whichFlags) { this[whichField] = this[whichField] & ~whichFlags; },
  setFlags: function(whichField, whichFlags) { this[whichField] = this[whichField] | whichFlags; },
  // jshint bitwise: true
  
  doubleBack: function() {
    var safePoint = Archonia.Form.XY();
    
    this.trail.forEach(function(ix, point) {
      var temp = Archonia.Cosmos.Sun.getTemperature(point);

      if(temp < this.genome.optimalTempHi &&
          temp > this.genome.optimalTempLo) { safePoint = Archonia.Form.XY(point); return false;}
      }, this);
    
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
    var drawDebugLines = true;
    
    if(drawDebugLines) {
      var p1 = Archonia.Form.XY(), p2 = Archonia.Form.XY();
    
      if(!this.trail.isEmpty()) {
        var color = 0x1111ff;
        this.trail.forEach(function(ix, value) {
          p1.set(value.plus(-squareSize / 2, -squareSize / 2)); p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, '#' + color.toString(16));
        
          p2.set(value.plus(-squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, '#' + color.toString(16));

          p1.set(value.plus(squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p2, p1, '#' + color.toString(16));
        
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, '#' + color.toString(16));
          
          color += 0x220000;
        });
      }
    }
    
  },
  
  launch: function(genome, legs, position) {
    this.genome = genome;
    this.legs = legs;
    this.position = position;

    this.howLongBetweenMoves = 2 * this.genome.maxMVelocity;
    
    this.start();
  },
  
  move: function() {
    var bestChoices = [], i = null, p = null;
    
    if(this.previousMoveTarget.equals(0)) { this.previousMoveTarget.set(this.position); }
    
    for(i = 0; i < 8; i++) {
      p = relativePositions[i].plus(this.previousMoveTarget);

      if(p.isInBounds()) {
        var tempTop = Archonia.Cosmos.Sun.getTemperature(relativePositions[0].plus(this.position));
        var tempBottom = Archonia.Cosmos.Sun.getTemperature(relativePositions[4].plus(this.position));
    
        var tooHot = tempBottom > this.genome.optimalTempHi;
        var tooCold = tempTop < this.genome.optimalTempLo;

        // if it's too cold, your only choices are up, and it doesn't
        // matter whether we've been there before; just find
        // a safe place to be
        if(tooCold) { if(i === 0 || i === 1 || i === 7) { bestChoices.push(p); } }
      
        else if(tooHot) { if(i === 3 || i === 4 || i === 5) { bestChoices.push(p); } }

        else if(!this.doWeRemember(p)) { bestChoices.push(p); }
      }
    }
    
    if(bestChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, bestChoices.length);
      p = bestChoices[i];
    } else {
      p = this.doubleBack();
      if(p === null) { console.log("encyst"); return;}
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
    
  start: function() { this.active = true; },
  
  tick: function(frameCount, foodTarget) {
    this.frameCount = frameCount;
    
    this.drawMemory();

    if(foodTarget.equals(0)) {
      if(this.active && this.frameCount > this.whenToIssueNextMoveOrder) { this.move(); } 
    } else {
      Archonia.Essence.Dbitmap.aLine(this.position, foodTarget, 'red');

      if(!this.currentFoodTarget.equals(foodTarget)) {
        this.currentFoodTarget.set(foodTarget);
        this.legs.setTargetPosition(this.currentFoodTarget);
      }
    }
    
    this.currentFoodTarget.set(foodTarget);
    
  },
};

})(Archonia);
