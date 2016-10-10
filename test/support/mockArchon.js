var Brain = require('./mockBrain.js');
var Genome = require('./mockGenome.js');

var Archon = function() {
  this.genome = new Genome();
  this.brain = new Brain(this);
  this.frameCount = 0;
};

Archon.prototype = {
  tick: function() { this.brain.tick(this.frameCount++); }
};

module.exports = Archon;
