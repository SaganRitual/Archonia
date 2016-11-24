/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {
  
var Drone = function(archon, dronoid) {
  this.genome = archon.genome;

  this.state = archon.state;
  this.sensor = dronoid;
  this.avatar = dronoid.getChildAt(0);
  this.button = dronoid.getChildAt(1);

  // The actual values are set in launch
  this.optimalTempRange = new Archonia.Form.Range(0, 1);
  
  this.tweenColor = new Archonia.Engine.TweenColorButton(this.button, "hsl(180, 100%, 50%)");
};

Drone.prototype = {
  decohere: function() { this.sensor.kill(); this.avatar.kill(); this.button.kill(); },
  
  launch: function(archonUniqueId, sensorScale, x, y) {
    this.sensor.archonUniqueId = archonUniqueId;
    
    this.tweening = false;
    
    this.optimalTempRange.set(this.genome.optimalTempLo, this.genome.optimalTempHi);

    this.sensor.alpha = 0;
    this.avatar.alpha = 0;
    this.button.alpha = 0;

    this.sensor.reset(x, y, 100);
    this.avatar.reset(0, 0, 100);
    this.button.reset(0, 0, 100);

    console.log("Firefly population " + Archonia.Engine.TheDronery.countDrones());

    var avatarScale = 1;
    var buttonScale = 1;

    this.sensor.scale.setTo(sensorScale, sensorScale);
    this.sensor.anchor.setTo(0.5, 0.5);
    this.sensor.alpha = 1;
  
    this.avatar.scale.setTo(avatarScale, avatarScale);
    this.avatar.anchor.setTo(0.5, 0.5);
    this.avatar.alpha = 1;
  
    this.button.scale.setTo(buttonScale, buttonScale);
    this.button.anchor.setTo(0.5, 0.5);
    this.button.alpha = 1;
  },
  
  tick: function() {
    this.avatar.tint = 0x00FF00; //this.genome.color;
    this.sensor.tint = 0xff0000;

    var temp = null, clampedTemp = null;
    
    temp = Archonia.Cosmos.TheAtmosphere.getTemperature(this.state.position);
  	clampedTemp = Archonia.Axioms.clamp(temp, this.genome.optimalTempLo, this.genome.optimalTempHi);

  	var hue = Archonia.Essence.hueRange.convertPoint(clampedTemp, this.optimalTempRange);
    if(hue < -1 || hue > 241) { throw new Error("Hue out of range"); }
    
    if(temp < this.genome.optimalTempLo) {
      if(!this.tweening) { this.tweenColor.start(hue, 180); this.tweening = true; }
    } else if(temp > this.genome.optimalTempHi) {
      if(!this.tweening) { this.tweenColor.start(hue, 60); this.tweening = true; }
    } else {
      if(this.tweening) { this.tweenColor.set(hue); this.tweening = false; }
    }
    
    this.tweenColor.tick();
  }
};

var spritePools = { sensors: null, avatars: null, buttons: null };

var constructDronoids = function() {
	spritePools.sensors.forEach(function(s) {
    var a = spritePools.avatars.getChildAt(0);
    var b = spritePools.buttons.getChildAt(0);

    s.addChild(a); s.addChild(b);
    s.avatar = a; s.button = b;

    s.visible = true;
    a.visble = true;
    s.inputEnabled = true;
    s.input.enableDrag();
    s.events.onDragStart.add(function(s) { var a = getArchonById(s.archonUniqueId); a.toggleMotion(); } );
	});
};

var getArchonById = function(id) { return Archonia.Cosmos.Archonery.getArchonById(id); };

var getDronoid = function() {
  var d = spritePools.sensors.getFirstDead();
  if(d === null) { throw new Error("No more dronoids in pool"); } else { return d; }
};

var handleOverlaps = function() {
  Archonia.Engine.game.physics.arcade.overlap(
    spritePools.sensors, Archonia.Cosmos.allTheManna, Archonia.Cosmos.Archonery.senseManna
  );
};

var setupSpritePools = function() {
	var setupPool = function(whichPool) {
    var image = null;
    
    switch(whichPool) {
      case "sensors": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooSensor"); break;
      case "buttons": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooButton"); break;
      case "avatars": image = Archonia.Engine.game.cache.getBitmapData("archoniaGooAvatar"); break;
    }

		spritePools[whichPool] = Archonia.Engine.game.add.group();
	  spritePools[whichPool].createMultiple(
      Archonia.Axioms.archonPoolSize, image, 0, false
    );
	};

	setupPool('sensors');
	setupPool('avatars', 'flare');
	setupPool('buttons');

  Archonia.Engine.game.physics.enable(spritePools.sensors, Phaser.Physics.ARCADE);
};

Archonia.Engine.TheDronery = {
  countDrones: function() { return spritePools.sensors.countLiving(); },
  getDrone: function(archon) { var dronoid = getDronoid(); return new Drone(archon, dronoid); },
  start: function() { setupSpritePools(); constructDronoids(); },
  tick: function() { handleOverlaps(); }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Engine.TheDronery;
}