/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global game, Phaser */

"use strict";

var A = A || {};

(function(A) {
  
  A.MannaGenerator = function() {
    var morselScale = 0.05;
    
    this.howManyMorsels = 500;
    this.howManyMorselsLaunched = 0;
    this.morselIndex = null;
    
    this.bellCurveHeight = 5;
    
    var stopBelow = 0.01, xOffset = 0, width = 2;
    this.bellCurve = A.generateBellCurve(stopBelow, this.bellCurveHeight, xOffset, width);
    if(this.bellCurve.length % 2 === 1) { this.bellCurve.push(0); }
    this.bellCurveRadius = this.bellCurve.length / 2;
    
    this.randomPoint = new A.RandomXY();
    this.randomPoint.setMin(0, 0);
    this.randomPoint.setMax(A.gameWidth, A.gameHeight);
    this.optimalTemp = 500;
    
    // We make the game scale larger than the radius so the manna will go off
    // the screen when the temps are extreme in either direction
    this.tempScale = new A.Range(-1000, 1000);
    this.gameScale = new A.Range(-A.gameRadius, A.gameRadius);
    this.arrayScale = new A.Range(-this.bellCurveRadius, this.bellCurveRadius);
    
    this.spriteGroup = game.add.group();
    this.spriteGroup.enableBody = true;
    this.spriteGroup.createMultiple(this.howManyMorsels, 'particles', 0, false);
    game.physics.enable(this.spriteGroup, Phaser.Physics.ARCADE);

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
  
  A.MannaGenerator.prototype = {
    
    giveth: function() {
      var thisParticle = null;
      var temp = A.Sun.getTemperature(A.gameCenter);
      
      for(var i = 0; i < 10; i++) {
        this.randomPoint.random();
        
        var scaledY = this.arrayScale.convertPoint(this.randomPoint.point.y, this.gameScale);
        var p = this.bellCurve[Math.floor(scaledY)] / this.bellCurveHeight;
        
        if(A.realInRange(0, 1) < p) {

          thisParticle = this.spriteGroup.getFirstDead();
          
          if(thisParticle === null) {
            break;
          } else {
            this.randomPoint.point.y += this.gameScale.convertPoint(temp, this.tempScale);
          
            if(this.randomPoint.point.y > 0 && this.randomPoint.point.y < A.gameHeight) {
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
          var r = A.integerInRange(0, this.bellCurve.length);
          var p = this.bellCurve[r] / this.bellCurveHeight;
    
          if(A.realInRange(0, 1) < p) {
            thisParticle.kill();
          }
        }
      }
    },
    
    render: function() {
    	var showDebugOutlines = false;

    	if(showDebugOutlines) {
    		this.spritePool.forEachAlive(function(a) {
    	    game.debug.body(a, 'yellow', false);
    			game.debug.spriteBounds(a, 'blue', false);
    		}, this);
    	}
    },
    
    tick: function(/*frameCount*/) {
      this.giveth();
      this.takethAway();
    }
    
  };
  
})(A);
