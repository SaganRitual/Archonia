/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('../Archonia.js');
  A.XY = require('../widgets/XY.js');
  A.Cbuffer = require('../widgets/Cbuffer.js');
}

(function(A) {

A.BrainStates = {
  BrainState: function(brain) { this.brain = brain; }
};

A.BrainStates.BrainState.prototype.tick = function(frameCount) {
  this.frameCount = frameCount;
};

A.BrainStates.Encyst = function(brain) {
  A.BrainStates.BrainState.call(this, brain);
};

A.BrainStates.Encyst.prototype = Object.create(A.BrainStates.BrainState.prototype);
A.BrainStates.Encyst.prototype.constructor = A.BrainStates.Encyst;

A.BrainStates.Encyst.prototype.tick = function(frameCount) {
  A.BrainStates.BrainState.prototype.tick.call(this, frameCount);
};

A.BrainStates.FindSafeTemp = function(brain) {
  A.BrainStates.BrainState.call(this, brain);
  
  this.brain = brain;
  this.tempCheck = new A.Cbuffer(this.brain.archon.genome.howLongBadTempToEncystment);
};

A.BrainStates.FindSafeTemp.prototype = Object.create(A.BrainStates.BrainState.prototype);
A.BrainStates.FindSafeTemp.prototype.constructor = A.BrainStates.FindSafeTemp;

A.BrainStates.FindSafeTemp.prototype.chooseAction = function() {
  var foundTolerableTemp = false, radius = this.brain.archon.genome.optimalTempRange / 2;
      
  this.tempCheck.forEach(function(ix, delta) {
    if(delta < radius) { foundTolerableTemp = true; return false; }
  });
  
  return foundTolerableTemp ? 'move' : 'encyst';
};

A.BrainStates.FindSafeTemp.prototype.start = function() {
  for(var i = 0; i < this.brain.archon.genome.howLongBadTempToEncystment; i++) {
    this.tempCheck.store(this.brain.archon.genome.optimalTemp);
  }
};

A.BrainStates.FindSafeTemp.prototype.tick = function(frameCount) {
  A.BrainStates.BrainState.prototype.tick.call(this, frameCount);

  var delta = Math.abs(this.brain.getTemperature(this.brain.position) - this.brain.archon.genome.optimalTemp);
  this.tempCheck.store(delta);
};

A.BrainStates.SearchForFood = function(brain) {
  A.BrainStates.BrainState.call(this, brain);
  
  this.searching = false;
  this.startOfSearchPending = false;
  this.turnPending = false;
  
  this.timeToTurn = -1;
  this.turnDirection = 1;
};

A.BrainStates.SearchForFood.prototype = Object.create(A.BrainStates.BrainState.prototype);
A.BrainStates.SearchForFood.prototype.constructor = A.BrainStates.SearchForFood;

A.BrainStates.SearchForFood.prototype.ack = function(action) {
  if(this.ackValue === null || action !== this.ackValue) { throw(new Error("Ack '" + action + "' received out of order")); }
  
  switch(this.ackValue) {
    case 'start':
      this.searching = true;
      this.startOfSearchPending = false;
      break;
      
    case 'turn':
      this.turnPending = false;
      this.turnDirection *= -1; // Next turn goes the other way
      break;
  }
  
  
  this.ackValue = null;
};

A.BrainStates.SearchForFood.prototype.chooseAction = function() {

  if(this.startOfSearchPending) {
    
    this.ackValue = 'start';

    // The brain has told us to start; until he tells us he has
    // received our instructions concerning the start of the
    // search, we keep giving him those instructions

    this.timeToTurn = this.frameCount + this.brain.archon.genome.foodSearchTimeBetweenTurns;

    if(this.brain.velocity.equals(0)) {
      return { action: 'setMoveTarget', moveTo: A.XY(A.integerInRange(0, A.gameWidth), A.integerInRange(0, A.gameHeight)) };
    } else {
      return { action: 'continue' };
    }
    
  } else if(this.turnPending) {

    this.ackValue = 'turn';
    
    var newTarget = A.XY(this.brain.velocity), computerizedAngle = null, robalizedAngle = null;

    computerizedAngle = newTarget.getAngleFrom(0);
    robalizedAngle = A.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6) * this.turnDirection;
    computerizedAngle = A.computerizeAngle(robalizedAngle);
    
    return({ action: 'turn', moveTo: A.XY.fromPolar(this.brain.archon.phenotype.getSize(), computerizedAngle) });
    
  } else {
    return { action: 'continue' };
  }
};

A.BrainStates.SearchForFood.prototype.start = function() {
  this.startOfSearchPending = true;
  this.ackValue = 'start';
};

A.BrainStates.SearchForFood.prototype.tick = function(frameCount) {
  A.BrainStates.BrainState.prototype.tick.call(this, frameCount);
  
  if(this.startOfSearchPending) {

    this.timeToTurn = this.frameCount + this.brain.archon.genome.foodSearchTimeBetweenTurns;

  } else if(this.searching) {

    if(this.turnPending) {
      this.timeToTurn = this.frameCount + this.brain.archon.genome.foodSearchTimeBetweenTurns;
    } else if(this.frameCount > this.timeToTurn) {
      this.turnPending = true;
    }

  } 
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.BrainStates;
}
