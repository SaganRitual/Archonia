var BrainStates = require('../../widgets/BrainStates.js');

var Brain = function(archon) {
  this.archon = archon;
  this.state_findSafeTemp = new BrainStates.FindSafeTemp(this);
  this.state_searchForFood = new BrainStates.SearchForFood(this);
  
  this.currentAction = { action: 'findSafeTemp' };
  this.tempStateInstructions = null;
  this.foodSearchStateInstructions = null;
};

Brain.prototype = {
  
  tick: function(frameCount) {
    this.state_findSafeTemp.update(frameCount, this.currentAction.action === 'findSafeTemp');
    this.state_searchForFood.update(frameCount, this.currentAction.action === 'searchForFood');

    this.tempStateInstructions = this.state_findSafeTemp.getInstruction();
    this.foodSearchStateInstructions = this.state_searchForFood.getInstruction();
  }
};

module.exports = Brain;