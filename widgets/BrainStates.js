/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {};

if(typeof window === "undefined") {
  Archotype = require('../Archonia.js');
  Archotype.Cbuffer = require('./Cbuffer.js');

  var xy = require('./XY.js');
  Archotype.XY = xy.XY;
  Archotype.RandomXY = xy.RandomXY;
}

(function(Archotype) {

Archotype.BrainStates = {
  BrainState: function(brain) { this.brain = brain; }
};

Archotype.BrainStates.BrainState.prototype.tick = function(frameCount) {
  this.frameCount = frameCount;
};

Archotype.BrainStates.Encyst = function(brain) {
  Archotype.BrainStates.BrainState.call(this, brain);
};

Archotype.BrainStates.Encyst.prototype = Object.create(Archotype.BrainStates.BrainState.prototype);
Archotype.BrainStates.Encyst.prototype.constructor = Archotype.BrainStates.Encyst;

Archotype.BrainStates.Encyst.prototype.tick = function(frameCount) {
  Archotype.BrainStates.BrainState.prototype.tick.call(this, frameCount);
};

Archotype.BrainStates.FindSafeTemp = function(brain) {
  Archotype.BrainStates.BrainState.call(this, brain);
  
  this.brain = brain;
  this.tempCheck = new Archotype.Cbuffer(this.brain.A, this.brain.archon.genome.howLongBadTempToEncystment);
};

Archotype.BrainStates.FindSafeTemp.prototype = Object.create(Archotype.BrainStates.BrainState.prototype);
Archotype.BrainStates.FindSafeTemp.prototype.constructor = Archotype.BrainStates.FindSafeTemp;

Archotype.BrainStates.FindSafeTemp.prototype.chooseAction = function() {
  var foundTolerableTemp = false, radius = this.brain.archon.genome.optimalTempRange / 2;
      
  this.tempCheck.forEach(function(ix, delta) {
    if(delta < radius) { foundTolerableTemp = true; return false; }
  });
  
  return foundTolerableTemp ? 'move' : 'encyst';
};

Archotype.BrainStates.FindSafeTemp.prototype.start = function() {
  for(var i = 0; i < this.brain.archon.genome.howLongBadTempToEncystment; i++) {
    this.tempCheck.store(this.brain.archon.genome.optimalTemp);
  }
};

Archotype.BrainStates.FindSafeTemp.prototype.tick = function(frameCount) {
  Archotype.BrainStates.BrainState.prototype.tick.call(this, frameCount);

  var delta = Math.abs(this.brain.getTemperature(this.brain.position) - this.brain.archon.genome.optimalTemp);
  this.tempCheck.store(delta);
};

Archotype.BrainStates.SearchForFood = function(brain) {
  Archotype.BrainStates.BrainState.call(this, brain);
  
  this.searching = false;
  this.startOfSearchPending = false;
  this.turnPending = false;
  
  this.timeToTurn = -1;
  this.turnDirection = 1;
};

Archotype.BrainStates.SearchForFood.prototype = Object.create(Archotype.BrainStates.BrainState.prototype);
Archotype.BrainStates.SearchForFood.prototype.constructor = Archotype.BrainStates.SearchForFood;

Archotype.BrainStates.SearchForFood.prototype.ack = function(action) {
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

Archotype.BrainStates.SearchForFood.prototype.chooseAction = function() {

  if(this.startOfSearchPending) {
    
    this.ackValue = 'start';

    // The brain has told us to start; until he tells us he has
    // received our instructions concerning the start of the
    // search, we keep giving him those instructions

    this.timeToTurn = this.frameCount + this.brain.archon.genome.foodSearchTimeBetweenTurns;

    if(this.brain.velocity.equals(0)) {
      return {
        action: 'setMoveTarget',
        moveTo: Archotype.XY(
          this.brain.A.integerInRange(0, this.brain.A.gameWidth), this.brain.A.integerInRange(0, this.brain.A.gameHeight)
        )
      };
    } else {
      return { action: 'continue' };
    }
    
  } else if(this.turnPending) {

    this.ackValue = 'turn';
    
    var newTarget = Archotype.XY(this.brain.velocity), computerizedAngle = null, robalizedAngle = null;

    computerizedAngle = newTarget.getAngleFrom(0);
    robalizedAngle = this.brain.A.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6) * this.turnDirection;
    computerizedAngle = this.brain.A.computerizeAngle(robalizedAngle);
    
    return({ action: 'turn', moveTo: Archotype.XY.fromPolar(this.brain.archon.phenotype.getSize(), computerizedAngle) });
    
  } else {
    return { action: 'continue' };
  }
};

Archotype.BrainStates.SearchForFood.prototype.start = function() {
  this.startOfSearchPending = true;
  this.ackValue = 'start';
};

Archotype.BrainStates.SearchForFood.prototype.tick = function(frameCount) {
  Archotype.BrainStates.BrainState.prototype.tick.call(this, frameCount);
  
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
  
})(Archotype);

if(typeof window === "undefined") {
  module.exports = Archotype.BrainStates;
}
