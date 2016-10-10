var BrainStates = {};

BrainStates.BrainState = function(brain) {
  this.returnValue = null;
};

BrainStates.BrainState.prototype = {
  update: function() {}
};

BrainStates.FindSafeTemp = function(brain) {
  BrainStates.BrainState.call(this, brain);
  
  this.returnValue = { action: 'move' };
};

BrainStates.FindSafeTemp.prototype = Object.create(BrainStates.BrainState.prototype);
BrainStates.FindSafeTemp.prototype.constructor = BrainStates.FindSafeTemp;

BrainStates.FindSafeTemp.prototype.getInstruction = function() {
  return this.returnValue;
};

BrainStates.FindSafeTemp.prototype.setReturn = function(returnValue) {
  this.returnValue = returnValue;
}

BrainStates.SearchForFood = function(brain) {
  BrainStates.BrainState.call(this, brain);
  
  this.returnValue = { action: 'continue', dVelocity: 0 };
};

BrainStates.SearchForFood.prototype = Object.create(BrainStates.BrainState.prototype);
BrainStates.SearchForFood.prototype.constructor = BrainStates.SearchForFood;

BrainStates.SearchForFood.prototype.getInstruction = function() {
  return this.returnValue;
};

BrainStates.SearchForFood.prototype.setReturn = function(returnValue) {
  this.returnValue = returnValue;
}


module.exports = BrainStates;