if(process.env['Brain'] === undefined) { process.env['Brain'] = './mockBrain.js'; }

var Brain = require(process.env['Brain']);

var Genome = require('./mockGenome.js');
var XY = require('../../widgets/XY.js').XY;

var Archon = function() {
  this.genome = new Genome();
  this.brain = new Brain(this);
  this.frameCount = 0;
  this.mVelocity = XY();
};

Archon.prototype = {
  launch: function() { this.brain.launch(); },
  tick: function() { this.brain.tick(this.frameCount++); },
  setMVelocity: function(vector) { this.mVelocity.set(vector); }
};

module.exports = Archon;
