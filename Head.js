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
  
  this.trail = new Archonia.Form.Cbuffer(20);
};

Archonia.Form.Head.prototype = {
  // jshint bitwise: false
  allFlagsOn: function(whichField, whichFlags) { return (this[whichField] & whichFlags)  === whichFlags; },
  anyFlagsOn: function(whichField, whichFlags) { return (this[whichField] & whichFlags) !== 0; },
  clearFlags: function(whichField, whichFlags) { this[whichField] = this[whichField] & ~whichFlags; },
  setFlags: function(whichField, whichFlags) { this[whichField] = this[whichField] | whichFlags; },
  // jshint bitwise: true
  
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
        this.trail.forEach(function(ix, value) {
          p1.set(value.plus(-squareSize / 2, -squareSize / 2)); p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, 'blue');
        
          p2.set(value.plus(-squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, 'blue');

          p1.set(value.plus(squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p2, p1, 'blue');
        
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, 'blue');
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
      
      if(!this.doWeRemember(p) && p.isInBounds()) { bestChoices.push(p); }
    }
    
    if(bestChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, bestChoices.length);
      p = bestChoices[i];
    } else {
      i = this.trail.getIndexOfOldestElement();
      p = this.trail.getElementAt(i);
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
  
  tick: function(frameCount) {
    this.frameCount = frameCount;
    
    this.drawMemory();
    
    if(this.active && this.frameCount > this.whenToIssueNextMoveOrder) { this.move(); } 
  },
};

})(Archonia);
