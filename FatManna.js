/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Cosmos.FatManna = function() {
  this.arrayScale = null;
  this.bellCurve = null;
  this.bellCurveHeight = 5;
  this.bellCurveRadius = null;
  this.gameScale = null;
  this.morselScale = 0.15;
  this.started = false;
  this.tempScale = null;
  this.frameCount = null;

  this.randomPoint = new Archonia.Form.RandomXY();
  this.randomPoint.setMin(0, 0);
  this.randomPoint.setMax(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
};

Archonia.Cosmos.FatManna.prototype = {

  initialize: function(allTheManna) {
  
    this.mannaGroup = Archonia.Engine.game.add.group();
    this.mannaGroup.enableBody = true;
    this.mannaGroup.createMultiple(100, 'fatManna', 0, false);
    Archonia.Engine.game.physics.enable(this.mannaGroup, Phaser.Physics.ARCADE);

    this.mannaGroup.forEach(function(m) {
      m.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
      m.calories = Archonia.Axioms.caloriesPerFatManna;
      m.anchor.setTo(0.5, 0.5);
      m.alpha = 1;
      m.scale.setTo(this.morselScale, this.morselScale);
      m.body.syncBounds = true;
      m.body.setSize(m.width, m.height);
      m.body.bounce.setTo(0, 0);
      m.body.collideWorldBounds = true;
      m.tint = 0;
      
      allTheManna.push(m);
    }, this);
  },

  giveth: function() {
    var thisParticle = null;
    
    this.randomPoint.random();
    this.randomPoint.point.floor();
    
    if(this.randomPoint.point.isInBounds()) {
      var temp = Archonia.Cosmos.Sun.getTemperature(this.randomPoint.point);

      if(temp < -200 || temp > 200) {
  
        thisParticle = this.mannaGroup.getFirstDead();
  
        if(thisParticle !== null) {
          thisParticle.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
          thisParticle.reset(this.randomPoint.point.x, this.randomPoint.point.y, 1);
        }
      }
    }
  },
  
  render: function() {
    if(!this.started) { return; }

  	var showDebugOutlines = false;

  	if(showDebugOutlines) {
  		this.mannaGroup.forEachAlive(function(a) {
  	    Archonia.Engine.game.debug.body(a, 'yellow', false);
  			Archonia.Engine.game.debug.spriteBounds(a, 'blue', false);
  		}, this);
  	}
  },
    
  start: function() { this.started = true; },
  
  takethAway: function() {
    this.mannaGroup.forEachAlive(function(a) {
      var t = Archonia.Cosmos.Sun.getTemperature(a.position);
      if(t > -200 && t < 200) { a.kill(); }
    });
  },
    
  tick: function(frameCount) {
    if(!this.started) { return; }
    
    this.frameCount = frameCount;
    
    if(this.frameCount % 60 === 0) { this.giveth(); }
    
    this.takethAway();
  }
    
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.FatManna;
}
