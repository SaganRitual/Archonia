/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

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

var geneReport = function(e, archon) {
  console.log(e, archon.archoniaUniqueObjectId);
  console.log(
    "Mass:", archon.goo.getMass().toFixed(2),
    "Temp:", Archonia.Cosmos.Sun.getTemperature(archon.position).toFixed()
  );
  
  for(var i in archon.genome.core) {
    if(i === "color") {
      var c = archon.genome.color;
      var s = c.toString(16);
      var z = ("000000").substr(0, 6 - s.length);
      var o = "#" + z + s;
      var t = tinycolor(o);
      console.log(t.toHslString());
    } else {
      console.log(i, archon.genome[i]);
    }
  }
  console.log('****************************');
};

var birthTweenComplete = function(archon) {
  archon.sprite.tint = archon.genome.color;
};

var getHueForTween = function() {
  return this.sprite.archoniaHue;
};

var setHueForTween = function(hue) {
  this.sprite.archoniaHue = hue;
  
  var hsl = "hsl(" + this.sprite.archoniaHue + ", 100%, 50%)";
  var t = tinycolor(hsl);

  this.sprite.tint = parseInt(t.toHex(), 16); 
};

Archonia.Form.Archon = function(phaseron) {
  this.firstLaunch = true;
  this.launched = false;
  this.sprite = phaseron;
  this.button = phaseron.button;
  this.sensor = phaseron.sensor;  this.sensor.archon = this;
  this.whichArchonReport = 0;
  
  var p = phaseron, b = p.button, s = p.sensor;

	p.anchor.setTo(0.5, 0.5); p.alpha = 1.0; p.tint = 0xFF0000; p.scale.setTo(0.07, 0.07);
	b.anchor.setTo(0.5, 0.5);	b.alpha = 1.0; b.tint = 0;        b.scale.setTo(0.25, 0.25);
	s.anchor.setTo(0.5, 0.5); s.alpha = 0.1; s.tint = 0x0000FF;  // s scale set in launch

	p.body.collideWorldBounds = true; p.inputEnabled = true; p.input.enableDrag();
  p.events.onDragStart.add(function(s) { geneReport("Report", s.archon); } );
  
  this.activatePhysicsBodies();
  
  generateArchonoidPrototype(); // This happens only once

  Object.defineProperty(this, 'archoniaHue', {
    get: function archoniaHue() {
      return getHueForTween.call(this); },
    set: function archoniaHue(v) {
      setHueForTween.call(this, v); }
  });
  
  this.foundCurrentFoodTarget = false;
  this.currentFoodTarget = Archonia.Form.XY();
  this.newFoodTarget = Archonia.Form.XY();
  
  this.position = new Archonia.Form.Archonoid(p);
  this.velocity = new Archonia.Form.Archonoid(p.body.velocity);
  
  Archonia.Cosmos.Genomer.genomifyMe(this); // No inheritance here; just getting a skeleton genome
  
  this.goo = new Archonia.Form.Goo(this);
  this.legs = new Archonia.Form.Legs();
  this.head = new Archonia.Form.Head(this);
};

Archonia.Form.Archon.prototype.activatePhysicsBodies = function() {
	var enable = function(c) {
		Archonia.Engine.game.physics.enable(c, Phaser.Physics.ARCADE);

		c.body.syncBounds = true;
		c.body.bounce.setTo(0, 0);
	};

	enable(this.sprite);
	enable(this.sensor);
};

Archonia.Form.Archon.prototype.breed = function() {
  if(!this.isDisabled) {
    this.howManyChildren++;
    Archonia.Cosmos.Dronery.breed(this);
  }
};

Archonia.Form.Archon.prototype.die = function() {
  this.sprite.kill(); this.button.kill(); this.sensor.kill();
};

Archonia.Form.Archon.prototype.eat = function(manna) {
  this.goo.eat(manna);
};

Archonia.Form.Archon.prototype.encyst = function() {
  this.velocity.set(0);
  this.encysted = true;
};

Archonia.Form.Archon.prototype.getMVelocity = function() {
  return this.velocity.getMagnitude();
};

Archonia.Form.Archon.prototype.getPosition = function() {
  return this.position;
};

Archonia.Form.Archon.prototype.getVelocity = function() {
  return this.velocity;
};

Archonia.Form.Archon.prototype.launch = function(myParentArchon) {
  this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
  
  Archonia.Cosmos.Genomer.inherit(this, myParentArchon);
  
  this.myParentArchon = myParentArchon;
  this.frameCount = Archonia.Axioms.integerInRange(0, 60);
  this.howManyChildren = 0;
  this.isDisabled = false;
  this.isDefending = false;
  this.injuryFactor = 0;
  this.encysted = false;
  this.whenToUnencyst = 0;
  this.currentPrey = null;
  this.currentPreyStillThere = false;
  this.newPrey = null;
  this.currentPredator = null;
  this.currentPredatorStillThere = false;
  this.newPredator = null;
  this.beingEaten = false;

  this.sensor.scale.setTo(this.genome.sensorScale, this.genome.sensorScale);  
  
  this.sensorWidth = this.sensor.width;
  this.sensorRadius = this.sensor.width / 2;

	this.sensor.body.setSize(this.sensorRadius, this.sensorRadius);
	this.sensor.body.setCircle(this.sensorRadius);

  this.firstLaunch = false;
  this.launched = true;
  
  this.legs.launch(this.position, this.genome.maxMVelocity, this.velocity, this.genome.maxMAcceleration);
  this.goo.launch(this.genome);
  this.head.launch(this.genome, this.legs, this.position);

  // Have to use reset instead of revive(); otherwise, everyone gets a
  // false positive on detecting another archon, and they all run away,
  // usually toward zero (that bit I'm not clear on, but it bothers me
  // much more for them to get a giant false positive at the beginning
  // of life)
  var x = null, y = null;
  
  if(myParentArchon === undefined) {
    x = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.width - 20);
    y = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.height - 20);

    this.myParentArchonId = 0;
    //Archonia.Axioms.archonia.familyTree.addMe(this.uniqueID, 'god');
  } else {
    x = myParentArchon.position.x; y = myParentArchon.position.y;

    this.position.set(myParentArchon.position);
    this.velocity.set(myParentArchon.velocity).timesScalar(-1);
    this.myParentArchonId = myParentArchon.archoniaUniqueObjectId;
   // Archonia.Axioms.archonia.familyTree.addMe(this.uniqueID, myParentArchon.uniqueID);
  }

  if(Archonia.Cosmos.momentOfCreation) {
    this.sprite.tint = this.genome.color;
  } else {
    // Remember: the property in the prototype is on the archon; the property
    // here is on the sprite. The get/set for the archon refer to this value
    this.archoniaHue = 0;
  
    this.birthTween = Archonia.Engine.game.add.tween(this).
      to({ archoniaHue: 240 }, 0.5 * 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, 2, false);
    
    this.birthTween.onComplete.add(birthTweenComplete);
  }

  this.sprite.reset(x, y, 1); this.button.reset(0, 0, 1); this.sensor.reset(x, y, 1);
};

Archonia.Form.Archon.prototype.senseArchon = function(theOtherGuy) {
  // Don't eat yourself, or your children, and don't be eaten
  // by your parent
  if(this.archoniaUniqueObjectId === theOtherGuy.archon.archoniaUniqueObjectId) { return; }
  if(this.archoniaUniqueObjectId === theOtherGuy.archon.myParentArchonId) { return; }
  if(this.myParentArchonId === theOtherGuy.archon.archoniaUniqueObjectId) { return; }

  var drawDebugLines = false;
  if(drawDebugLines === true) {
    Archonia.Essence.Dbitmap.aLine(this.position, theOtherGuy.archon, 'blue');
  }
  
  var m = this.goo.getMass(), n = theOtherGuy.archon.goo.getMass();

  if(theOtherGuy.archon.head.encysted || m / n > this.genome.predationRatio) {
  
    // We're already working on one meal; stick with it until we're done
    if(theOtherGuy.archon.archoniaUniqueObjectId === this.currentPrey) {
      this.currentPreyStillThere = true;
      this.newPrey = null;
    }
  
    if(this.newPrey === null && !this.currentPreyStillThere) {
      this.newPrey = theOtherGuy.archon.archoniaUniqueObjectId;
    }

  } else if(n / m > theOtherGuy.archon.genome.predationRatio && !theOtherGuy.archon.head.encysted) {
  
    // We're already working on one meal; stick with it until we're done
    if(theOtherGuy.archon.archoniaUniqueObjectId === this.currentPredator) {
      this.currentPredatorStillThere = true;
      this.newPredator = null;
    }
  
    if(this.newPredator === null && !this.currentPredatorStillThere) {
      this.newPredator = theOtherGuy.archon.archoniaUniqueObjectId;
    }

  }
};

Archonia.Form.Archon.prototype.senseManna = function(manna) {
  if(this.position.getDistanceTo(manna) < this.sensorRadius) {
    
    if(this.currentFoodTarget.equals(manna)) {
      this.foundCurrentFoodTarget = true;
    } else {
      var c = this.position.getDistanceTo(this.newFoodTarget);
      var n = this.position.getDistanceTo(manna);
    
      if(this.newFoodTarget.equals(0) || n < c) {
        this.newFoodTarget.set(manna);
      }
    }
    
    var drawDebugLines = false;
    
    if(drawDebugLines) {
      if(this.foundCurrentFoodTarget) {
        Archonia.Essence.Dbitmap.aLine(this.position, this.currentFoodTarget, 'blue');
      }
      
      if(!this.newFoodTarget.equals(0)) {
        Archonia.Essence.Dbitmap.aLine(this.position, this.newFoodTarget, 'yellow');
      }
    }
  }
};

Archonia.Form.Archon.prototype.setPosition = function(a1, a2) {
  this.position.set(a1, a2);
};

Archonia.Form.Archon.prototype.setVelocity = function(a1, a2) {
  this.velocity.set(a1, a2);
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
  if(!this.launched) { return; }
  
  this.frameCount++;
  
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
  
  if(!this.foundCurrentFoodTarget) {
    this.currentFoodTarget.set(this.newFoodTarget);
  }
  
  this.foundCurrentFoodTarget = false;
  this.newFoodTarget.set(0);
  
  if(!this.encysted) {
    this.legs.tick(this.frameCount);
  }
  
  if(!this.currentPreyStillThere) { this.currentPrey = this.newPrey; }
  if(!this.currentPredatorStillThere) { this.currentPredator = this.newPredator; }
  if(this.currentPredator === null && this.newPredator === null) { this.beingEaten = false; }
  
  this.goo.tick(this.frameCount);
  this.head.tick(this.frameCount, this.currentFoodTarget, this.currentPredator, this.currentPrey);
  
  this.currentPreyStillThere = false; this.newPrey = null;
  this.currentPredatorStillThere = false; this.newPredator = null;
};

Archonia.Form.Archon.prototype.unencyst = function() { this.encysted = false; };

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}
