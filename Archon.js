/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
// Have to delay creation of the prototype because it needs XY,
// which doesn't exist until later, when XY.js gets loaded
var generateArchonoidPrototype = function() { 
  if(Archonia.Form.Archonoid === undefined) {
    Archonia.Form.Archonoid = function(archonite) { this.archonite = archonite; Archonia.Form.XY.call(this); };

    Archonia.Form.Archonoid.prototype = Object.create(Archonia.Form.XY.prototype);
    Archonia.Form.Archonoid.prototype.constructor = Archonia.Form.Archonoid;

    Object.defineProperty(Archonia.Form.Archonoid.prototype, 'x', {
      get: function x() { return this.archonite.x; },
      set: function x(v) { this.archonite.x = v; }
    });

    Object.defineProperty(Archonia.Form.Archonoid.prototype, 'y', {
      get: function y() { return this.archonite.y; },
      set: function y(v) { this.archonite.y = v; }
    });
  }
};

Archonia.Form.Archon = function(phaseron) {
  this.firstLaunch = true;
  this.sprite = phaseron;
  this.button = phaseron.button;
  this.sensor = phaseron.sensor;  this.sensor.archon = this;
  this.whichArchonReport = 0;
  
  var p = phaseron, b = p.button, s = p.sensor;

	p.anchor.setTo(0.5, 0.5); p.alpha = 1.0; p.tint = 0x00FF00; p.scale.setTo(0.07, 0.07);
	b.anchor.setTo(0.5, 0.5);	b.alpha = 1.0; b.tint = 0;        b.scale.setTo(0.25, 0.25);
	s.anchor.setTo(0.5, 0.5); s.alpha = 0.0; s.tint = 0x0000FF;  // s scale set in launch

	p.body.collideWorldBounds = true; p.inputEnabled = true; p.input.enableDrag();
  
  this.activatePhysicsBodies();
  
  generateArchonoidPrototype(); // This happens only once
  
  this.position = new Archonia.Form.Archonoid(p);
  this.velocity = new Archonia.Form.Archonoid(p.body.velocity);
  
  Archonia.Cosmos.Genomer.genomifyMe(this); // No inheritance here; just getting a skeleton genome

  this.mover = new Archonia.Form.Mover(this.sprite, 25, this.velocity, this.position);
};

Archonia.Form.Archon.prototype.activatePhysicsBodies = function() {
	var enable = function(c) {
		Archonia.Engine.game.physics.enable(c, Phaser.Physics.ARCADE);

		c.body.syncBounds = true;
		c.body.bounce.setTo(0, 0);
	};

	enable(this.sprite);
	this.setSize(false);

	enable(this.sensor);
  
  this.sensorWidth = this.sensor.width;
  this.sensorRadius = this.sensor.width / 2;

	this.sensor.body.setSize(this.sensorRadius, this.sensorRadius);
	this.sensor.body.setCircle(this.sensorRadius);
};

Archonia.Form.Archon.prototype.breed = function() {
  if(!this.isDisabled) {
    this.howManyChildren++;
    this.god.breed(this);
  }
};

Archonia.Form.Archon.prototype.getMVelocity = function() {
  return this.velocity.getMagnitude();
};

Archonia.Form.Archon.prototype.getPosition = function() {
  return this.position;
};

Archonia.Form.Archon.prototype.getSize = function() {
  return this.sprite.width;
};

Archonia.Form.Archon.prototype.getVelocity = function() {
  return this.velocity;
};

Archonia.Form.Archon.prototype.launch = function(myParentArchon) {
  Archonia.Cosmos.Genomer.inherit(this, myParentArchon);
  
  this.myParentArchon = myParentArchon;
  this.frameCount = Archonia.Axioms.integerInRange(0, 60);
  this.whichFlash = 'birth';
  this.flashDuration = 0.5 * 60;
  this.flashInterval = 5;
  this.flashExpiration = this.frameCount + this.flashDuration; // Flash birth for five seconds
  this.howManyChildren = 0;
  this.flashDirection = -1;
  this.isDisabled = false;
  this.isDefending = false;
  this.injuryFactor = 0;
  
  this.flashes = {
    birth: { on: 0xFFFFFF, off: 0 },
    defending: { on: 0xFF0000, off: 0x0000FF }
  };

	/*this.uniqueID = this.god.getUniqueID();
  if(this.uniqueID === 0) {
    this.sprite.tint = 0x00FFFF;  // For debugging, so I can see archon 0
  }*/
  
  this.sensor.scale.setTo(this.sensorScale, this.sensorScale);  

  if(myParentArchon === undefined) {
    this.position.set(
      Archonia.Axioms.integerInRange(20, Archonia.Engine.game.width - 20),
      Archonia.Axioms.integerInRange(20, Archonia.Engine.game.height - 20)
    );
    //Archonia.Axioms.archonia.familyTree.addMe(this.uniqueID, 'god');
  } else {
    this.position.set(myParentArchon.position);
   // Archonia.Axioms.archonia.familyTree.addMe(this.uniqueID, myParentArchon.uniqueID);
  }

  this.firstLaunch = false;
  
  this.mover.launch();

	this.sprite.revive(); this.button.revive(); this.sensor.revive();
};

Archonia.Form.Archon.prototype.setPosition = function(a1, a2) {
  this.position.set(a1, a2);
};

Archonia.Form.Archon.prototype.setVelocity = function(a1, a2) {
  this.velocity.set(a1, a2);
};

Archonia.Form.Archon.prototype.setSize = function(lizerIsLaunched) {
  var mass = null, babyFat = 0, adultFat = 0, embryoFat = 0;
  
  if(lizerIsLaunched) {
    babyFat = this.lizer.babyCalorieBudget;
    adultFat = this.lizer.calorieBudget;
    embryoFat = this.lizer.embryoCalorieBudget;
  } else {
    babyFat = Archonia.Axioms.babyFatAtBirth;
    adultFat = Archonia.Axioms.adultFatAtBirth;
    embryoFat = 0;
  }
  
  mass = (
    (babyFat / Archonia.Axioms.babyFatDensity) +
    (adultFat / Archonia.Axioms.adultFatDensity) +
    (embryoFat / Archonia.Axioms.embryoFatDensity)
  );
  
	var p = Archonia.Essence.archonSizeRange.convertPoint(mass, Archonia.Essence.archonMassRange);

	this.sprite.scale.setTo(p, p);

	var w = this.sprite.width;	// Have to tell the body to keep up with the sprite
	this.sprite.body.setSize(w, w);
	this.sprite.body.setCircle(w / 2);
};

Archonia.Form.Archon.prototype.getSize = function() {
  return this.sprite.width / Archonia.Form.rg.bm.width;
};

Archonia.Form.Archon.prototype.setMVelocity = function(vector) {
  this.velocity.set(vector);
};

Archonia.Form.Archon.prototype.throttle = function(id, interval, callback, context) {
  if(this.uniqueID === id && this.frameCount % interval === 0) {
    callback.call(context);
  }
};

Archonia.Form.Archon.prototype.tick = function() {
  this.frameCount++;
  
  if(this.isDefending) {
    this.flashExpiration = this.frameCount + this.flashDuration;
    this.whichFlash = 'defending';
    this.isDefending = false;
    this.flashDirection = 1;
  }
  
  if((this.flashExpiration - this.frameCount) % this.flashInterval === 0) {
    this.flashDirection *= -1;
  }
  
  if(this.frameCount > this.flashExpiration) {
    this.flashDirection = 0;
  }
  
  if(this.flashDirection === 1) {
    this.sprite.tint = this.flashes[this.whichFlash].on;
  } else if(this.flashDirection === -1) {
    this.sprite.tint = this.flashes[this.whichFlash].off;
  } else {
    this.sprite.tint = this.color;
  }
  
  // If I've been injured so badly (or was born with a serious defect),
  // then everyone can see me as injured. This doesn't matter unless
  // I'm a parasite. Normally, a parasite is immune to parasitism;
  // other parasites will leave me alone. But when they see my
  // injury they'll come after me
  if(this.maxMVelocity < Archonia.Axioms.maxMagnitudeV / 5) {
    this.isDisabled = true;
  }

  this.sensor.x = this.sprite.x; // So the sensor will stay attached
  this.sensor.y = this.sprite.y; // So the sensor will stay attached
  
  this.mover.tick(this.frameCount);
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}
