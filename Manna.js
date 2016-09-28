/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global game, Phaser */

"use strict";

var A = A || {};

(function(A) {
  
  A.MG = function() {
    var howManyMorsels = 1000;
    var morselSize = 3;       // in pixels
    var morselScale = morselSize / A.archoniaGooDiameter;
    
    this.randomPoint = new A.RandomXY();
    this.randomPoint.setMin(0, 0);
    this.randomPoint.setMax(A.gameWidth, A.gameHeight);
    
    this.spriteGroup = game.add.group();
    this.spriteGroup.enableBody = true;
    this.spriteGroup.createMultiple(howManyMorsels, game.cache.getBitmapData('archoniaGoo'), 0, false);
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
  
  A.MG.prototype = {
    
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
      var thisParticle = this.spriteGroup.getFirstDead();

      if(thisParticle !== null) {
        this.randomPoint.random();

        thisParticle.position.setTo(this.randomPoint.point.x, this.randomPoint.point.y);
        thisParticle.revive();
      }
    }
    
  };
  
  A.MannaGenerator = {
    mannaGenerator: null,
    
    bestow: function() {
      A.MannaGenerator = new A.MG();
    },
    
    render: function() {
      A.MannaGenerator.mannaGenerator.render();
    },
    
    tick: function(frameCount) {
      A.MannaGenerator.mannaGenerator.tick(frameCount);
    }
    
  };
  
})(A);
