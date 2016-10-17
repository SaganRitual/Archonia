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
  
  var MG = Archonia.Cosmos.MannaGenerator = {
    start: function() {
      var morselScale = 0.05;
    
      MG.howManyMorsels = 500;
      MG.howManyMorselsLaunched = 0;
      MG.morselIndex = null;
    
      MG.bellCurveHeight = 5;
    
      var stopBelow = 0.01, xOffset = 0, width = 2;
      MG.bellCurve = Archonia.Axioms.generateBellCurve(stopBelow, MG.bellCurveHeight, xOffset, width);
      if(MG.bellCurve.length % 2 === 1) { MG.bellCurve.push(0); }
      MG.bellCurveRadius = MG.bellCurve.length / 2;
    
      MG.randomPoint = new Archonia.Form.RandomXY();
      MG.randomPoint.setMin(0, 0);
      MG.randomPoint.setMax(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      MG.optimalTemp = 500;
    
      // We make the A.game scale larger than the radius so the manna will go off
      // the screen when the temps are extreme in either direction
      MG.tempScale = new Archonia.Form.Range(-1000, 1000);
      MG.gameScale = new Archonia.Form.Range(-Archonia.Axioms.gameRadius, Archonia.Axioms.gameRadius);
      MG.arrayScale = new Archonia.Form.Range(-MG.bellCurveRadius, MG.bellCurveRadius);
    
      MG.spriteGroup = Archonia.Engine.game.add.group();
      MG.spriteGroup.enableBody = true;
      MG.spriteGroup.createMultiple(MG.howManyMorsels, 'particles', 0, false);
      Archonia.Engine.game.physics.enable(MG.spriteGroup, Phaser.Physics.ARCADE);

      MG.spriteGroup.forEach(function(m) {
        m.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
        m.calories = Archonia.Axioms.caloriesPerManna;
        m.previousEmit = 0;
        m.birthday = 0;
        m.anchor.setTo(0.5, 0.5);
        m.scale.setTo(morselScale, morselScale);
        m.alpha = 1;
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
        MG.randomPoint.random();
        
        var scaledY = MG.arrayScale.convertPoint(MG.randomPoint.point.y, MG.gameScale);
        var p = MG.bellCurve[Math.floor(scaledY)] / MG.bellCurveHeight;
        
        if(Archonia.Axioms.realInRange(0, 1) < p) {

          thisParticle = MG.spriteGroup.getFirstDead();
          
          if(thisParticle === null) {
            break;
          } else {
            MG.randomPoint.point.y += MG.gameScale.convertPoint(temp, MG.tempScale);
          
            if(MG.randomPoint.point.y > 0 && MG.randomPoint.point.y < Archonia.Axioms.gameHeight) {
              thisParticle.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
              thisParticle.position.setTo(MG.randomPoint.point.x, MG.randomPoint.point.y);
              thisParticle.revive();
            }
          }
          
        }
      }
    },
    
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
    	var showDebugOutlines = false;

    	if(showDebugOutlines) {
    		MG.spritePool.forEachAlive(function(a) {
    	    MG.game.debug.body(a, 'yellow', false);
    			MG.game.debug.spriteBounds(a, 'blue', false);
    		}, this);
    	}
    },
    
    tick: function(/*frameCount*/) {
      MG.giveth();
      MG.takethAway();
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.MannaGenerator;
}
