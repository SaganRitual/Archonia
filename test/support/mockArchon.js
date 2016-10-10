/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

Archonia.Cosmos.Genomer = require('../../Genomer.js').Genomer;
Archonia.Form.Brain = require('../../Brain.js');
Archonia.Form.XY = require('../../widgets/XY.js').XY;


(function(Archonia) {
  
  Archonia.Cosmos.Genomer.start();
  
Archonia.Form.Archon = function() {
  Archonia.Cosmos.Genomer.genomifyMe(this); // No inheritance here; just getting a skeleton genome

  this.position = Archonia.Form.XY();
  this.velocity = Archonia.Form.XY();
  
  this.frameCount = 0;
};

Archonia.Form.Archon.prototype.launch = function(brain, genomeSetup) {
  Archonia.Cosmos.Genomer.inherit(this);

  genomeSetup(this);
  // Important! The real archon doesn't do this; it creates
  // its own brain. This mockup is for testing the brain itself
  this.brain = brain;
  this.brain.launch();
}

Archonia.Form.Archon.prototype.setPosition = function(a1, a2) {
  this.position.set(a1, a2);
};

Archonia.Form.Archon.prototype.setVelocity = function(a1, a2) {
  this.velocity.set(a1, a2);
};

Archonia.Form.Archon.prototype.setSize = function(lizerIsLaunched) {
};

Archonia.Form.Archon.prototype.getSize = function() {
  return 2;
};

Archonia.Form.Archon.prototype.setMVelocity = function(vector) {
  this.velocity.set(vector);
};

Archonia.Form.Archon.prototype.tick = function() {
  this.frameCount++;
  this.brain.tick(this.frameCount);
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}
