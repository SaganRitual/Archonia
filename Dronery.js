/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
  
  Archonia.Form.Archon = require('./Archon.js');
}

(function(Archonia) {
  
  var spritePools = { sensors: null, phaserons: null, buttons: null };

  var constructPhaserons = function() {
  	spritePools.phaserons.forEach(function(a) {
  		var ix = spritePools.phaserons.getIndex(a);
  		var s = spritePools.sensors.getChildAt(ix);

  		Archonia.Engine.game.physics.enable(a, Phaser.Physics.ARCADE);
  		Archonia.Engine.game.physics.enable(s, Phaser.Physics.ARCADE);

  		// Always get the one at zero, because the addChild() below
  		// removes this one from the pool
  		var b = spritePools.buttons.getChildAt(0);
  		a.addChild(b);	// b is removed from its pool by this call
    
        a.sensor = s; a.button = b; s.sprite = a;
  	}, Archonia.Cosmos.Dronery);
  };

  var setupSpritePools = function() {
  	var setupPool = function(whichPool) {
  		spritePools[whichPool] = Archonia.Engine.game.add.group();
  	  spritePools[whichPool].enableBody = true;
  	  spritePools[whichPool].createMultiple(500, Archonia.Engine.game.cache.getBitmapData('archoniaGoo'), 0, false);
  	  Archonia.Engine.game.physics.enable(spritePools[whichPool], Phaser.Physics.ARCADE);
  	};

  	setupPool('sensors');
  	setupPool('phaserons');
  	setupPool('buttons');
  };

Archonia.Cosmos.Dronery = {

  start: function() {
  	setupSpritePools();
  	constructPhaserons();
  
  	for(var i = 0; i < Archonia.Axioms.archonCount; i++) {
      Archonia.Cosmos.Dronery.breed();
    }
  },

  breed: function(parentArchon) {
  	var phaseron = spritePools.phaserons.getFirstDead();
  	if(phaseron === null) { throw "No more phaserons in pool"; }
  
    phaseron.inputEnabled = true;
    phaseron.input.enableDrag();
  
    if(phaseron.archon === undefined) {
      phaseron.archon = new Archonia.Form.Archon(phaseron);
    }
  
    phaseron.archon.launch(parentArchon);
  },
  
  eat: function(phaseron, manna) { manna.kill(); },

  render: function() {
  	var showDebugOutlines = false;

  	if(showDebugOutlines) {
  		spritePools.phaserons.forEachAlive(function(a) {
        Archonia.Engine.game.debug.body(a, 'yellow', false);
        Archonia.Engine.game.debug.body(a.archon.sensor, 'blue', false);
        
        Archonia.Engine.game.debug.spriteBounds(a, 'blue', false);
        Archonia.Engine.game.debug.spriteBounds(a.archon.sensor, 'magenta', false);
      });
  	}
  },
  
  sense: function(sensor, manna) { sensor.archon.sense(manna); },

  tick: function() {
    Archonia.Essence.Dbitmap.bm.clear();

    Archonia.Engine.game.physics.arcade.overlap(
      spritePools.sensors, Archonia.Cosmos.MannaGenerator.spriteGroup,
      Archonia.Cosmos.Dronery.sense
    );

    Archonia.Engine.game.physics.arcade.overlap(
      spritePools.phaserons, Archonia.Cosmos.MannaGenerator.spriteGroup,
      Archonia.Cosmos.Dronery.eat
    );
    
  	spritePools.phaserons.forEachAlive(function(a) {
      a.archon.tick();
  	});
  }

};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Dronery;
}