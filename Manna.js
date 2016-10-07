/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Form: {}, Phaser: {} } || {};

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Phaser.game = new Phaser.Game();

  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.Range = require('./widgets/Range.js');
  
  var xy = require('./widgets/XY.js');
  Archonia.Form.XY = xy.XY;
  Archonia.Form.RandomXY = xy.RandomXY;
}

(function(Archonia) {
  
  Archonia.Form.MannaGenerator = function() {
    var morselScale = 0.05;
    
    this.howManyMorsels = 500;
    this.howManyMorselsLaunched = 0;
    this.morselIndex = null;
    
    this.bellCurveHeight = 5;
    
    var stopBelow = 0.01, xOffset = 0, width = 2;
    this.bellCurve = Archonia.Axioms.generateBellCurve(stopBelow, this.bellCurveHeight, xOffset, width);
    if(this.bellCurve.length % 2 === 1) { this.bellCurve.push(0); }
    this.bellCurveRadius = this.bellCurve.length / 2;
    
    this.randomPoint = new Archonia.Form.RandomXY();
    this.randomPoint.setMin(0, 0);
    this.randomPoint.setMax(this.gameWidth, this.gameHeight);
    this.optimalTemp = 500;
    
    // We make the A.game scale larger than the radius so the manna will go off
    // the screen when the temps are extreme in either direction
    this.tempScale = new Archonia.Form.Range(-1000, 1000);
    this.gameScale = new Archonia.Form.Range(-Archonia.Axioms.gameRadius, Archonia.Axioms.gameRadius);
    this.arrayScale = new Archonia.Form.Range(-this.bellCurveRadius, this.bellCurveRadius);
    
    this.spriteGroup = Archonia.Phaser.game.add.group();
    this.spriteGroup.enableBody = true;
    this.spriteGroup.createMultiple(this.howManyMorsels, 'particles', 0, false);
    Archonia.Phaser.game.physics.enable(this.spriteGroup, Phaser.Physics.ARCADE);

    this.spriteGroup.forEach(function(m) {
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
  };
  
  Archonia.Form.MannaGenerator.prototype = {
    
    giveth: function() {
      var thisParticle = null;
      var temp = Archonia.Axioms.sun.getTemperature(this.gameCenter);
      
      for(var i = 0; i < 10; i++) {
        this.randomPoint.random();
        
        var scaledY = this.arrayScale.convertPoint(this.randomPoint.point.y, this.gameScale);
        var p = this.bellCurve[Math.floor(scaledY)] / this.bellCurveHeight;
        
        if(Archonia.Axioms.realInRange(0, 1) < p) {

          thisParticle = this.spriteGroup.getFirstDead();
          
          if(thisParticle === null) {
            break;
          } else {
            this.randomPoint.point.y += this.gameScale.convertPoint(temp, this.tempScale);
          
            if(this.randomPoint.point.y > 0 && this.randomPoint.point.y < this.gameHeight) {
              thisParticle.position.setTo(this.randomPoint.point.x, this.randomPoint.point.y);
              thisParticle.revive();
            }
          }
          
        }
      }
    },
    
    takethAway: function() {
      for(var i = 0; i < 10; i++) {
        var thisParticle = this.spriteGroup.getRandom();
        if(thisParticle.alive) {
          var r = Archonia.Axioms.integerInRange(0, this.bellCurve.length);
          var p = this.bellCurve[r] / this.bellCurveHeight;
    
          if(Archonia.Axioms.realInRange(0, 1) < p) {
            thisParticle.kill();
          }
        }
      }
    },
    
    render: function() {
    	var showDebugOutlines = false;

    	if(showDebugOutlines) {
    		this.spritePool.forEachAlive(function(a) {
    	    this.game.debug.body(a, 'yellow', false);
    			this.game.debug.spriteBounds(a, 'blue', false);
    		}, this);
    	}
    },
    
    tick: function(/*frameCount*/) {
      this.giveth();
      this.takethAway();
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.MannaGenerator;
}
