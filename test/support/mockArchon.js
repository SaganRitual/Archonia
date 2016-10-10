var Brain = require('./mockBrain.js');
var Genome = require('./mockGenome.js');
var XY = require('../../widgets/XY.js').XY;

var Archon = function() {
  this.genome = new Genome();
  this.brain = new Brain(this);
  this.frameCount = 0;
  this.velocity = XY();
};

Archon.prototype = {
  tick: function() { this.brain.tick(this.frameCount++); }
};

module.exports = Archon;
