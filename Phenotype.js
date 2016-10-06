/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {};

if(typeof window === "undefined") {
  Archotype = require('./Archonia.js');
  Archotype.tinycolor = require('./widgets/tinycolor.js');
  Archotype.Range = require('./widgets/Range.js');
}

(function(Archotype) {
  
  var adultFatDensity = 100;  // 100 calories per gram
  var larvaFatDensity = 1000;
  var embryoFatDensity = 1000;

Archotype.Phenotype = function(A, archon) {
  
  if(archon === undefined) {
    throw new TypeError("Phenotype needs an archon");
  }
  
  this.A = A;
  this.archon = archon;
  this.genome = archon.genome;
  this.embryoCalorieBudget = 0;
  this.larvalCalorieBudget = 0;
  this.adultCalorieBudget = 0;
  
  this.optimalTempRange = new Archotype.Range();
  
};

Archotype.Phenotype.prototype = {
  
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
      this.genome.offspringMass.adultCalories + this.genome.offspringMass.larvalCalories
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
    var t = this.A.sun.getTemperature(this.archon);
    var d = Math.abs(t - this.genome.optimalTemp);
    var s = this.getMass();
    var p = Math.log((d || 1) + 1) * Math.log(s + 1);

    return p;
  },
  
  launch: function() {
    this.larvalCalorieBudget = this.genome.birthMass.larvalCalories;
    this.adultCalorieBudget = this.genome.birthMass.adultCalories;
    
    var tempRangeRadius = this.genome.optimalTempRangeWidth / 2;
    this.optimalTempRange.set(this.genome.optimalTemp - tempRangeRadius, this.genome.optimalTemp + tempRangeRadius);
    
    this.setSize();
  },

  setButtonColor: function(temp) {
  	temp = this.A.clamp(temp, this.optimalTempRange.lo, this.optimalTempRange.hi);

  	var hue = this.A.buttonHueRange.convertPoint(temp, this.optimalTempRange);
  	var hsl = 'hsl(' + Math.floor(hue) + ', 100%, 50%)';
  	var rgb = Archotype.tinycolor(hsl).toHex();
  	var tint = parseInt(rgb, 16);

  	this.archon.button.tint = tint;
  },
  
  setColors: function() {
    var t = this.A.sun.getTemperature(this.archon);

    this.setButtonColor(t);
  },
  
  setSize: function() {
    var m = this.getMass();
    var s = m / this.A.archoniaGooDiameter;
    
    this.archon.phaseron.scale.setTo(s, s);
    
    this.archon.phaseron.body.setSize(s, s);
    this.archon.phaseron.body.setCircle(s / 2);
  }
};
  
})(Archotype);

if(typeof window === "undefined") {
  module.exports = Archotype.Phenotype;
}
