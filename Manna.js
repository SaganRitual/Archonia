/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global game, Phaser */

"use strict";

var A = A || {};

(function(A) {
  
  A.MannaGenerator = function() {
    var morselScale = 0.05;
    
    this.howManyMorsels = 500;
    this.bellCurveHeight = 5;
    
    var stopBelow = 0.01, xOffset = 0, width = 2;
    this.bellCurve = A.generateBellCurve(stopBelow, this.bellCurveHeight, xOffset, width);
    if(this.bellCurve.length % 2 === 1) { this.bellCurve.push(0); }
    this.bellCurveRadius = this.bellCurve.length / 2;
    
    this.randomPoint = new A.RandomXY();
    this.randomPoint.setMin(0, 0);
    this.randomPoint.setMax(A.gameWidth, A.gameHeight);
    
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
    
    getMannaPoint: function() {
      this.randomPoint.random();
      var scaledY = this.arrayScale.convertPoint(this.randomPoint.point.y, this.gameScale);
      var p = this.bellCurve[Math.floor(scaledY)] / this.bellCurveHeight;
      
      return A.realInRange(0, 1) < p;
    },
    
    givethAndTaketh: function() {
      var thisParticle = null;
      
      for(var i = 0; i < 10; i++) {
        thisParticle = this.spriteGroup.getFirstDead();

        if(thisParticle !== null && this.getMannaPoint()) {
          thisParticle.position.setTo(this.randomPoint.point.x, this.randomPoint.point.y);
          thisParticle.revive();
        }
      }
      
      var c = this.spriteGroup.countLiving();
      if(c >= this.howManyMorsels) {
        var r = A.integerInRange(0, c - 1);

        thisParticle = this.spriteGroup.getChildAt(r);
        if(thisParticle === null) { throw new ReferenceError("Sprite group behaving not as you expected"); }

        r = A.integerInRange(0, this.bellCurve.length);
        var p = this.bellCurve[r];
      
        if(A.realInRange(0, 1) < (p / this.bellCurveHeight)) {
          thisParticle.kill();
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
      this.givethAndTaketh();
    }
    
  };
  
})(A);
