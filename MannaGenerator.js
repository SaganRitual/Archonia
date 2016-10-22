/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();

  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.Range = require('./widgets/Range.js');
  
  var xy = require('./widgets/XY.js');
  Archonia.Form.XY = xy.XY;
  Archonia.Form.RandomXY = xy.RandomXY;
  
  Archonia.Essence = require('./Essence.js');
  Archonia.Cosmos.Sun = require('./Sun.js');
  
  Archonia.Cosmos.Sun.ignite();
}

(function(Archonia) {
  
  var arrayScale = null;
  var bellCurve = null;
  var bellCurveHeight = 5;
  var bellCurveRadius = null;
  var gameScale = null;
  var morselScale = 0.05;
  var started = false;
  var tempScale = null;

  var giveth = function() {
    var thisParticle = null;
    var temp = Archonia.Cosmos.Sun.getTemperature(Archonia.Essence.gameCenter);
    
    for(var i = 0; i < 10; i++) {
      var rp = new Archonia.Form.RandomXY();
      rp.setMin(0, 0);
      rp.setMax(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      rp.random();
      
      var scaledY = arrayScale.convertPoint(rp.point.y, gameScale);
      var p = bellCurve[Math.floor(scaledY)] / bellCurveHeight;
      
      if(Archonia.Axioms.realInRange(0, 1) < p) {

        thisParticle = Archonia.Cosmos.MannaGenerator.spriteGroup.getFirstDead();
        
        if(thisParticle === null) {
          break;
        } else {
          rp.point.y += gameScale.convertPoint(temp, tempScale);
          rp.point.floor();
        
          if(rp.point.isInBounds()) {
            thisParticle.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
            thisParticle.body.position.setTo(rp.point.x, rp.point.y);
            thisParticle.position.setTo(rp.point.x, rp.point.y);
            thisParticle.reset(rp.point.x, rp.point.y);
            thisParticle.revive();
          }
        }
        
      }
    }
  };
  
  var takethAway = function() {
    for(var i = 0; i < 10; i++) {
      var thisParticle = Archonia.Cosmos.MannaGenerator.spriteGroup.getRandom();
      if(thisParticle.alive) {
        var r = Archonia.Axioms.integerInRange(0, bellCurve.length);
        var p = bellCurve[r] / bellCurveHeight;
  
        if(Archonia.Axioms.realInRange(0, 1) < p) {
          thisParticle.kill();
        }
      }
    }
  };
  
  Archonia.Cosmos.MannaGenerator = {
    frameCount: null,

    initialize: function() {
    
      var stopBelow = 0.01, xOffset = 0, width = 2;
      bellCurve = Archonia.Axioms.generateBellCurve(stopBelow, bellCurveHeight, xOffset, width);
      if(bellCurve.length % 2 === 1) { bellCurve.push(0); }
      bellCurveRadius = bellCurve.length / 2;
    
      // We make the A.game scale larger than the radius so the manna will go off
      // the screen when the temps are extreme in either direction
      tempScale = new Archonia.Form.Range(-1000, 1000);
      gameScale = new Archonia.Form.Range(-Archonia.Axioms.gameRadius, Archonia.Axioms.gameRadius);
      arrayScale = new Archonia.Form.Range(-bellCurveRadius, bellCurveRadius);
    
      Archonia.Cosmos.MannaGenerator.spriteGroup = Archonia.Engine.game.add.group();
      Archonia.Cosmos.MannaGenerator.spriteGroup.enableBody = true;
      Archonia.Cosmos.MannaGenerator.spriteGroup.createMultiple(Archonia.Axioms.howManyMannaMorsels, 'particles', 0, false);
      Archonia.Engine.game.physics.enable(Archonia.Cosmos.MannaGenerator.spriteGroup, Phaser.Physics.ARCADE);

      Archonia.Cosmos.MannaGenerator.spriteGroup.forEach(function(m) {
        m.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
        m.calories = Archonia.Axioms.caloriesPerManna;
        m.previousEmit = 0;
        m.birthday = 0;
        m.anchor.setTo(0.5, 0.5);
        m.scale.setTo(morselScale, morselScale);
        m.alpha = 1;
        m.body.syncBounds = true;
        m.body.setSize(m.width, m.height);
        m.body.bounce.setTo(0, 0);
        m.body.collideWorldBounds = true;
        m.tint = 0x5C008E;
      }, this);
    },
    
    start: function() { started = true; },
    
    render: function() {
      if(!started) { return; }

    	var showDebugOutlines = false;

    	if(showDebugOutlines) {
    		Archonia.Cosmos.MannaGenerator.spriteGroup.forEachAlive(function(a) {
    	    Archonia.Engine.game.debug.body(a, 'yellow', false);
    			Archonia.Engine.game.debug.spriteBounds(a, 'blue', false);
    		}, this);
    	}
    },
    
    tick: function(frameCount) {
      if(!started) { return; }
      
      Archonia.Cosmos.MannaGenerator.frameCount = frameCount;
      giveth();
      takethAway();
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.MannaGenerator;
}
