/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();

  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.Range = require('./Minions/Range.js');
  
  var xy = require('./Minions/XY.js');
  Archonia.Form.XY = xy.XY;
  Archonia.Form.RandomXY = xy.RandomXY;
  
  Archonia.Essence = require('./Essence.js');
  Archonia.Cosmos.Sun = require('./Sun.js');
  
  Archonia.Cosmos.Sun.ignite();
}

(function(Archonia) {
  
Archonia.Cosmos.MannaGenerator = function() {
  this.arrayScale = null;
  this.bellCurve = null;
  this.bellCurveHeight = 5;
  this.bellCurveRadius = null;
  this.gameScale = null;
  this.morselScale = 1;
  this.started = false;
  this.tempScale = null;
  this.frameCount = null;
};

Archonia.Cosmos.MannaGenerator.prototype = {

  initialize: function(allTheManna) {
  
    var stopBelow = 0.01, xOffset = 0, width = 2;
    this.bellCurve = Archonia.Axioms.generateBellCurve(stopBelow, this.bellCurveHeight, xOffset, width);
    if(this.bellCurve.length % 2 === 1) { this.bellCurve.push(0); }
    this.bellCurveRadius = this.bellCurve.length / 2;
  
    // We make the A.game scale larger than the radius so the manna will go off
    // the screen when the temps are extreme in either direction
    this.tempScale = new Archonia.Form.Range(-1000, 1000);
    this.gameScale = new Archonia.Form.Range(-Archonia.Axioms.gameRadius, Archonia.Axioms.gameRadius);
    this.arrayScale = new Archonia.Form.Range(-this.bellCurveRadius, this.bellCurveRadius);
  
    this.mannaGroup = Archonia.Engine.game.add.group();
    this.mannaGroup.enableBody = true;
    var b = Archonia.Engine.game.cache.getBitmapData('archoniaGooButton');
    this.mannaGroup.createMultiple(Archonia.Axioms.howManyMannaMorsels, b, 0, false);
    Archonia.Engine.game.physics.enable(this.mannaGroup, Phaser.Physics.ARCADE);

    this.mannaGroup.forEach(function(m) {
      m.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
      m.calories = Archonia.Axioms.caloriesPerManna;
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
    var temp = Archonia.Cosmos.TheAtmosphere.getTemperature(Archonia.Essence.gameCenter);
    
    for(var i = 0; i < 10; i++) {
      var rp = new Archonia.Form.RandomXY();
      rp.setMin(0, 0);
      rp.setMax(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      rp.random();
      
      var scaledY = this.arrayScale.convertPoint(rp.point.y, this.gameScale);
      var p = this.bellCurve[Math.floor(scaledY)] / this.bellCurveHeight;
      
      if(Archonia.Axioms.realInRange(0, 1) < p) {

        thisParticle = this.mannaGroup.getFirstDead();
        
        if(thisParticle === null) {
          break;
        } else {
          rp.point.y += this.gameScale.convertPoint(temp, this.tempScale);
          rp.point.floor();
        
          if(rp.point.isInBounds()) {
            thisParticle.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
            thisParticle.reset(rp.point.x, rp.point.y, 1);
          }
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
    for(var i = 0; i < 10; i++) {
      var thisParticle = this.mannaGroup.getRandom();
      
      if(thisParticle.alive) {
        var r = Archonia.Axioms.integerInRange(0, this.bellCurve.length);
        var p = this.bellCurve[r] / this.bellCurveHeight;

        if(Archonia.Axioms.realInRange(0, 1) < p) {
          thisParticle.kill();
        }
      }
    }
  },
    
  tick: function(frameCount) {
    if(!this.started) { return; }
    
    this.frameCount = frameCount;
    this.giveth();
    this.takethAway();
  }
    
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.MannaGenerator;
}
