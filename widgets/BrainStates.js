/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Form.Cbuffer = require('./Cbuffer.js');
  Archonia.Form.XY = require('./XY.js').XY;
}

(function(Archonia) {

Archonia.Form.BrainStates = {
  BrainState: function(brain) { this.brain = brain; }
};

Archonia.Form.BrainStates.BrainState.prototype.tick = function(frameCount) {
  this.frameCount = frameCount;
};

Archonia.Form.BrainStates.Encyst = function(brain) {
  Archonia.Form.BrainStates.BrainState.call(this, brain);
};

Archonia.Form.BrainStates.Encyst.prototype = Object.create(Archonia.Form.BrainStates.BrainState.prototype);
Archonia.Form.BrainStates.Encyst.prototype.constructor = Archonia.Form.BrainStates.Encyst;

Archonia.Form.BrainStates.Encyst.prototype.tick = function(frameCount) {
  Archonia.Form.BrainStates.BrainState.prototype.tick.call(this, frameCount);
};

Archonia.Form.BrainStates.FindSafeTemp = function(brain) {
  Archonia.Form.BrainStates.BrainState.call(this, brain);
  
  this.brain = brain;
  this.tempCheck = new Archonia.Form.Cbuffer(this.brain.archon.genome.howLongBadTempToEncystment);
};

Archonia.Form.BrainStates.FindSafeTemp.prototype = Object.create(Archonia.Form.BrainStates.BrainState.prototype);
Archonia.Form.BrainStates.FindSafeTemp.prototype.constructor = Archonia.Form.BrainStates.FindSafeTemp;

Archonia.Form.BrainStates.FindSafeTemp.prototype.chooseAction = function() {
  var foundTolerableTemp = false, radius = this.brain.archon.genome.optimalTempRange / 2;
      
  this.tempCheck.forEach(function(ix, delta) {
    if(delta < radius) { foundTolerableTemp = true; return false; }
  });
  
  return foundTolerableTemp ? 'move' : 'encyst';
};

Archonia.Form.BrainStates.FindSafeTemp.prototype.start = function() {
  for(var i = 0; i < this.brain.archon.genome.howLongBadTempToEncystment; i++) {
    this.tempCheck.store(this.brain.archon.genome.optimalTemp);
  }
};

Archonia.Form.BrainStates.FindSafeTemp.prototype.tick = function(frameCount) {
  Archonia.Form.BrainStates.BrainState.prototype.tick.call(this, frameCount);

  var delta = Math.abs(this.brain.getTemperature(this.brain.position) - this.brain.archon.genome.optimalTemp);
  this.tempCheck.store(delta);
};

Archonia.Form.BrainStates.SearchForFood = function(brain) {
  Archonia.Form.BrainStates.BrainState.call(this, brain);
  
  this.searching = false;
  this.startOfSearchPending = false;
  this.turnPending = false;
  
  this.timeToTurn = -1;
  this.turnDirection = 1;
};

Archonia.Form.BrainStates.SearchForFood.prototype = Object.create(Archonia.Form.BrainStates.BrainState.prototype);
Archonia.Form.BrainStates.SearchForFood.prototype.constructor = Archonia.Form.BrainStates.SearchForFood;

Archonia.Form.BrainStates.SearchForFood.prototype.ack = function(action) {
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

Archonia.Form.BrainStates.SearchForFood.prototype.chooseAction = function() {

  if(this.startOfSearchPending) {
    
    this.ackValue = 'start';

    // The brain has told us to start; until he tells us he has
    // received our instructions concerning the start of the
    // search, we keep giving him those instructions

    this.timeToTurn = this.frameCount + this.brain.archon.genome.foodSearchTimeBetweenTurns;

    if(this.brain.velocity.equals(0)) {
      return {
        action: 'setMoveTarget',
        moveTo: Archonia.Form.XY(
          Archonia.Axioms.integerInRange(0, Archonia.Axioms.gameWidth), Archonia.Axioms.integerInRange(0, Archonia.Axioms.gameHeight)
        )
      };
    } else {
      return { action: 'continue' };
    }
    
  } else if(this.turnPending) {

    this.ackValue = 'turn';
    
    var newTarget = Archonia.Form.XY(this.brain.velocity), computerizedAngle = null, robalizedAngle = null;

    computerizedAngle = newTarget.getAngleFrom(0);
    robalizedAngle = Archonia.Axioms.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6) * this.turnDirection;
    computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
    
    return({ action: 'turn', moveTo: Archonia.Form.XY.fromPolar(this.brain.archon.phenotype.getSize(), computerizedAngle) });
    
  } else {
    return { action: 'continue' };
  }
};

Archonia.Form.BrainStates.SearchForFood.prototype.start = function() {
  this.startOfSearchPending = true;
  this.ackValue = 'start';
};

Archonia.Form.BrainStates.SearchForFood.prototype.tick = function(frameCount) {
  Archonia.Form.BrainStates.BrainState.prototype.tick.call(this, frameCount);
  
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
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.BrainStates;
}
