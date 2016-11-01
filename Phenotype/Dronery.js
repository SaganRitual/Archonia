/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Drone = function(dronoid) {
  this.sensor = dronoid;
  this.avatar = dronoid.getChildAt(0);
  this.button = dronoid.getChildAt(1);
};

Drone.prototype = {
  decohere: function() { this.sensor.kill(); this.avatar.kill(); this.button.kill(); },
  
  launch: function(archonId, sensorScale, x, y) {
    this.sensor.archonId = archonId;
    
    this.sensor.reset(x, y, 100);
    this.avatar.reset(0, 0, 100);
    this.button.reset(0, 0, 100);

    var avatarScale = Archonia.Axioms.avatarRadius * 2 / (sensorScale * 100);
    var buttonScale = avatarScale / 3;

    this.sensor.scale.setTo(sensorScale, sensorScale);
    this.sensor.anchor.setTo(0.5, 0.5);
    this.sensor.alpha = 1;
  
    this.avatar.scale.setTo(avatarScale, avatarScale);
    this.avatar.anchor.setTo(0.5, 0.5);
    this.avatar.alpha = 3;//this.avatar.tint = 0x00ffff;
  
    this.button.scale.setTo(buttonScale, buttonScale);
    this.button.anchor.setTo(0.5, 0.5);
    this.button.alpha = 3; this.button.tint = 0xff0000;
  },
  
  setColor: function(colorAsDecimal) { this.avatar.tint = colorAsDecimal; }
};

var spritePools = { sensors: null, avatars: null, buttons: null };

var constructDronoids = function() {
	spritePools.sensors.forEach(function(s) {
    var a = spritePools.avatars.getChildAt(0);
    var b = spritePools.buttons.getChildAt(0);

    s.addChild(a); s.addChild(b);
    s.avatar = a; s.button = b;

    s.inputEnabled = true;
    s.input.enableDrag();
    s.events.onDragStart.add(function(s) { var a = getArchonById(s.archonId); a.toggleMotion(); } );
	});
};

var getArchonById = function(id) { return Archonia.Cosmos.Archonery.getArchonById(id); };

var getDronoid = function() {
  var d = spritePools.sensors.getFirstDead();
  if(d === null) { throw new Error("No more dronoids in pool"); } else { return d; }
};

var handleOverlaps = function() {
  Archonia.Engine.game.physics.arcade.overlap(
    spritePools.sensors, Archonia.Cosmos.skinnyManna.mannaGroup, Archonia.Cosmos.Archonery.senseSkinnyManna
  );
};

var setupSpritePools = function() {
	var setupPool = function(whichPool) {
    var bmData = (whichPool === "sensors") ? "archoniaSensorGoo" : "archoniaGoo";

		spritePools[whichPool] = Archonia.Engine.game.add.group();
	  spritePools[whichPool].createMultiple(
      Archonia.Axioms.archonPoolSize, Archonia.Engine.game.cache.getBitmapData(bmData), 0, false
    );
	};

	setupPool('sensors');
	setupPool('avatars');
	setupPool('buttons');

  Archonia.Engine.game.physics.enable(spritePools.sensors, Phaser.Physics.ARCADE);
};

Archonia.Cosmos.Dronery = {
  getDrone: function(archonId) { var dronoid = getDronoid(archonId); return new Drone(dronoid); },
  start: function() { setupSpritePools(); constructDronoids(); },
  tick: function() { handleOverlaps(); }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Dronery;
}