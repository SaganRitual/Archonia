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
  
  var started = false;
  
  var MG = Archonia.Cosmos.MannaGenerator = {
    initialize: function() {
      var morselScale = 0.05;
    
      MG.howManyMorselsLaunched = 0;
      MG.morselIndex = null;
    
      MG.bellCurveHeight = 5;
    
      var stopBelow = 0.01, xOffset = 0, width = 2;
      MG.bellCurve = Archonia.Axioms.generateBellCurve(stopBelow, MG.bellCurveHeight, xOffset, width);
      if(MG.bellCurve.length % 2 === 1) { MG.bellCurve.push(0); }
      MG.bellCurveRadius = MG.bellCurve.length / 2;
    
      // We make the A.game scale larger than the radius so the manna will go off
      // the screen when the temps are extreme in either direction
      MG.tempScale = new Archonia.Form.Range(-1000, 1000);
      MG.gameScale = new Archonia.Form.Range(-Archonia.Axioms.gameRadius, Archonia.Axioms.gameRadius);
      MG.arrayScale = new Archonia.Form.Range(-MG.bellCurveRadius, MG.bellCurveRadius);
    
      MG.spriteGroup = Archonia.Engine.game.add.group();
      MG.spriteGroup.enableBody = true;
      MG.spriteGroup.createMultiple(Archonia.Axioms.howManyMannaMorsels, 'particles', 0, false);
      Archonia.Engine.game.physics.enable(MG.spriteGroup, Phaser.Physics.ARCADE);

      MG.spriteGroup.forEach(function(m) {
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
  
    giveth: function() {
      var thisParticle = null;
      var temp = Archonia.Cosmos.Sun.getTemperature(Archonia.Essence.gameCenter);
      
      for(var i = 0; i < 10; i++) {
        var rp = new Archonia.Form.RandomXY();
        rp.setMin(0, 0);
        rp.setMax(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
        rp.random();
        
        var scaledY = MG.arrayScale.convertPoint(rp.point.y, MG.gameScale);
        var p = MG.bellCurve[Math.floor(scaledY)] / MG.bellCurveHeight;
        
        if(Archonia.Axioms.realInRange(0, 1) < p) {

          thisParticle = MG.spriteGroup.getFirstDead();
          
          if(thisParticle === null) {
            break;
          } else {
            rp.point.y += MG.gameScale.convertPoint(temp, MG.tempScale);
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
    },
    
    start: function() { started = true; },
    
    takethAway: function() {
      for(var i = 0; i < 10; i++) {
        var thisParticle = MG.spriteGroup.getRandom();
        if(thisParticle.alive) {
          var r = Archonia.Axioms.integerInRange(0, MG.bellCurve.length);
          var p = MG.bellCurve[r] / MG.bellCurveHeight;
    
          if(Archonia.Axioms.realInRange(0, 1) < p) {
            thisParticle.kill();
          }
        }
      }
    },
    
    render: function() {
      if(!started) { return; }

    	var showDebugOutlines = false;

    	if(showDebugOutlines) {
    		MG.spriteGroup.forEachAlive(function(a) {
    	    Archonia.Engine.game.debug.body(a, 'yellow', false);
    			Archonia.Engine.game.debug.spriteBounds(a, 'blue', false);
    		}, this);
    	}
    },
    
    tick: function(frameCount) {
      if(!started) { return; }
      
      MG.frameCount = frameCount;
      MG.giveth();
      MG.takethAway();
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.MannaGenerator;
}
