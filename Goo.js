/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
  Archonia.Form.tinycolor = require('./widgets/tinycolor.js');
  Archonia.Form.Range = require('./widgets/Range.js');
}

(function(Archonia) {
  
  var adultFatDensity = 100;  // 100 calories per gram
  var larvaFatDensity = 1000;
  var embryoFatDensity = 1000;

Archonia.Form.Goo = function(archon) {
  
  if(archon === undefined) {
    throw new TypeError("Goo needs an archon");
  }
  
  this.archon = archon;
  this.embryoCalorieBudget = 0;
  this.larvalCalorieBudget = 0;
  this.adultCalorieBudget = 0;
  
};

Archonia.Form.Goo.prototype = {
  
  reproductionCostFactor: 1.25,

  applyBenefit: function(bucket, benefit, threshold) {
    this[bucket] += benefit;
    
    if(this[bucket] > threshold) { benefit = this[bucket] - threshold; this[bucket] = threshold; }
    else { benefit = 0; }
  
    return benefit;
  },

  applyCost: function(bucket, cost) {
    this[bucket] -= cost;
    
    if(this[bucket] < 0) { cost = -this[bucket]; this[bucket] = 0; }
    else { cost = 0; }
  
    return cost;
  },
  
  breed: function() {

    var remainingReproductionCost = (
      200
//      this.genome.offspringMass.adultCalories + this.genome.offspringMass.larvalCalories
    ) * this.reproductionCostFactor;
    
    remainingReproductionCost = this.applyCost('embryoCalorieBudget', remainingReproductionCost);
    
    this.debit(remainingReproductionCost);
    
    // Process all the fees before reproducing, to make sure I have the full
    // reserves necessary for the process. If the fees are too high, I die without
    // giving birth. Most of my calories are lost, but the other archons can eat
    // my rotting corpse.
    if(this.adultCalorieBudget > 0) {
      this.archon.breed();
    }
  },
  
  debit: function(costInCalories) {
    // Use up your baby fat reserves first
    costInCalories = this.applyCost('larvalCalorieBudget', costInCalories);
    
    // if you're starving, you can reabsorb any embryo reserves
    // you've built up, but you don't get all the calories back

    if(costInCalories > 0 && this.embryoCalorieBudget > 0) {
      var t = costInCalories * (4 / 3);

      costInCalories = this.applyCost('embryoCalorieBudget', t);
    }
    
    costInCalories = this.applyCost('adultCalorieBudget', costInCalories);

    if(this.adultCalorieBudget === 0) { this.die(); }
  },
  
  die: function() {
    // Dummy for talking to test harness until we have an archon to talk to
    this.archon.die();
  },

  eat: function(food) {
    var benefit = food.calories;

    benefit = this.applyBenefit('adultCalorieBudget', benefit, this.genome.embryoThreshold);
    
    if(benefit > 0) {
      benefit = this.applyBenefit('embryoCalorieBudget', benefit, Number.MAX_VALUE);

      if(this.embryoCalorieBudget > this.genome.reproductionThreshold) {
        this.breed();
      }
    }
    
    this.setSize();  
  },
  
  getMass: function() {
    var a = this.embryoCalorieBudget / embryoFatDensity;
    var b = this.adultCalorieBudget / adultFatDensity;
    var c = this.larvalCalorieBudget / larvaFatDensity;
    
    return a + b + c;
  },
  
  getMotionCost: function() {
    return this.getMass();
  },

  getTempCost: function() {
    var t = Archonia.Cosmos.Sun.getTemperature(this.archon.position);
    var d = Math.abs(t - this.genome.optimalTemp);
    var s = this.getMass();
    var p = Math.log((d || 1) + 1) * Math.log(s + 1);

    return p;
  },
  
  launch: function(genome) {
    this.genome = genome;
    this.larvalCalorieBudget = 100;//this.genome.birthMass.larvalCalories;
    this.adultCalorieBudget = 100;//this.genome.birthMass.adultCalories;
    
    this.optimalTempRange = new Archonia.Form.Range(this.genome.optimalTempLo, this.genome.optimalTempHi);
    
    this.setSize();
  },

  setButtonColor: function(temp) {
  	temp = Archonia.Axioms.clamp(temp, this.optimalTempRange.lo, this.optimalTempRange.hi);

  	var hue = Archonia.Essence.buttonHueRange.convertPoint(temp, this.optimalTempRange);
  	var hsl = 'hsl(' + Math.floor(hue) + ', 100%, 50%)';
  	var rgb = Archonia.Form.tinycolor(hsl).toHex();
  	var tint = parseInt(rgb, 16);

  	this.archon.button.tint = tint;
  },
  
  setColors: function() {
    var t = Archonia.Cosmos.Sun.getTemperature(this.archon.position);

    this.setButtonColor(t);
  },
  
  setSize: function() {
    var m = this.getMass();
    var s = m / Archonia.Axioms.archoniaGooDiameter;
    
    this.archon.sprite.scale.setTo(s, s);
    
    this.archon.sprite.body.setSize(s, s);
    this.archon.sprite.body.setCircle(s / 2);
  },
  
  tick: function() {}
  /*tick: function(frameCount) {
    this.setColors();
    
    var m = this.getMotionCost();
    var t = this.getTempCost();
  }*/
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Goo;
}
