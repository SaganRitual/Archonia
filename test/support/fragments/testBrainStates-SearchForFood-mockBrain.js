var B = {};

B.BrainStates = require('../../../widgets/BrainStates.js');
B.XY = require('../../../widgets/XY.js').XY;

(function(B) {
  B.Brain = function(archon) {
    this.archon = archon;
    this.searchForFood = new B.BrainStates.SearchForFood(this);
  
    this.frameCount = 0;
    this.state = null;
    this.ackValue = null;
  
    this.velocity = B.XY();
    this.action = null;
  };

  B.Brain.prototype = {
    ack: function(ackValue) {
      switch(this.state) {
        case 'searchForFood': this.searchForFood.ack(ackValue); break;
      }
    
      this.ackValue = null;
    },
  
    chooseAction: function() {
      switch(this.state) {
        case 'searchForFood': this.action = this.searchForFood.chooseAction(); break;
      }
    
      return this.action;
    },
  
    startSearchForFood: function() { this.searchForFood.start(); this.state = 'searchForFood'; },
  
    tick: function() {
      this.frameCount++;
      this.searchForFood.tick(this.frameCount);
    }
  };
})(B);

module.exports = B.Brain;
