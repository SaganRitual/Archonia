var BrainStates = require('../../widgets/BrainStates.js');

var Brain = function(archon) {
  this.archon = archon;
  this.state_findSafeTemp = new BrainStates.FindSafeTemp(this);
  
  this.currentAction = { action: 'findSafeTemp' };
  this.stateInstructions = null;
};

Brain.prototype = {
  
  tick: function(frameCount) {
    this.state_findSafeTemp.update(frameCount, this.currentAction.action === 'findSafeTemp');
    this.stateInstructions = this.state_findSafeTemp.getInstruction();
  }
};

module.exports = Brain;