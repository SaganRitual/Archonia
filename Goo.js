/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
  Archonia.Form.Range = require('./widgets/Range.js');

  tinycolor = require('./widgets/tinycolor.js');
}

(function(Archonia) {
  
  var adultFatDensity = 100;  // 100 calories per gram
  var larvaFatDensity = 1000;
  var embryoFatDensity = 1000;

Archonia.Form.Goo = function(archon) {
  
  if(archon === undefined) {
    Archonia.Axioms.hurl(new Error("Goo needs an archon"));
  }
  
  this.archon = archon;
  this.embryoCalorieBudget = 0;
  this.larvalCalorieBudget = 0;
  this.adultCalorieBudget = 0;
  
};

Archonia.Form.Goo.prototype = {
  
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
  
  bePoisoned: function(poisoner) {
    // This function is the reciprocal of the eat function. Should clean up so
    // we don't have two functions doing basically the same thing
    var myTotalCalories = (
      this.adultCalorieBudget + this.embryoCalorieBudget + this.larvalCalorieBudget
    ) / 60;
    
    var whatIWillLose = myTotalCalories * poisoner.genome.toxinStrength / this.genome.toxinResistance;
    this.debit(whatIWillLose);
    
    // There is a cost for secreting poison, of course
    var whatHeWillLose = whatIWillLose * 0.1;
    poisoner.goo.debit(whatHeWillLose);
    
    this.archon.beingPoisoned = true;
  },
  
  breed: function() {
    
    var remainingReproductionCost = (
      this.genome.offspringMassAdultCalories + this.genome.offspringMassLarvalCalories
    ) * Archonia.Axioms.reproductionCostFactor;
    
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
    this.archon.die();
  },

  eat: function(food) {
    if(this.archon.encysted) { return; }  // You don't gain anything while encysted
    
    var benefit = 0;
    
    if(food instanceof Archonia.Form.Archon) {
      
      if(this.genome.toxinResistance >= food.genome.toxinStrength) {
        benefit = this.eatArchon(food);
      } else {
        this.bePoisoned(food);
      }

    } else {
      benefit = food.calories;
    }

    if(benefit > 0) {
      benefit = this.applyBenefit('adultCalorieBudget', benefit, this.genome.embryoThreshold);
    } else {
      this.debit(benefit);
    }
    
    if(benefit > 0) {
      benefit = this.applyBenefit('embryoCalorieBudget', benefit, Number.MAX_VALUE);

      if(this.embryoCalorieBudget > this.genome.reproductionThreshold) {
        this.breed();
      }
    }
    
    this.setSize();  
  },
  
  eatArchon: function(dinner) {
    var dinnerTotalCalories = (
      dinner.goo.adultCalorieBudget + dinner.goo.embryoCalorieBudget + dinner.goo.larvalCalorieBudget
    ) / 60;
    
    // Prey loses a lot more from predation than the predator gains
    var whatPreyWillLose = dinnerTotalCalories * Archonia.Axioms.calorieLossRatioForPredation;
    dinner.goo.debit(whatPreyWillLose);
    
    return dinnerTotalCalories;
  },
  
  getMass: function() {
    var a = this.embryoCalorieBudget / embryoFatDensity;
    var b = this.adultCalorieBudget / adultFatDensity;
    var c = this.larvalCalorieBudget / larvaFatDensity;
    
    return a + b + c;
  },
  
  getMotionCost: function() {
    return this.getMass() * (this.genome.maxMVelocity / 10) + (this.genome.maxMAcceleration / 3);
  },
  
  getSensorCost: function() { return 15 * this.genome.sensorScale / Archonia.Axioms.standardSensorScale; },

  getTempCost: function() {
    var t = Archonia.Cosmos.Sun.getTemperature(this.archon.position);
    var d = Math.abs(t - this.genome.optimalTemp);
    var s = this.getMass();
    var p = 2 * Math.log((d || 1) + 1) * Math.log(s + 1);

    var r = 5 * this.genome.tempRange / Archonia.Axioms.standardArchonTempRange;

    return p + r;
  },
  
  howHungryAmI: function() {
    return (this.genome.reproductionThreshold - this.embryoCalorieBudget) * this.genome.hungerToleranceFactor;
  },
  
  launch: function(genome) {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
    
    this.genome = genome;
    this.larvalCalorieBudget = this.genome.birthMassLarvalCalories;
    this.adultCalorieBudget = this.genome.birthMassAdultCalories;
    
    this.optimalTempRange = new Archonia.Form.Range(this.genome.optimalTempLo, this.genome.optimalTempHi);
    
    this.setSize();
  },
  
  metabolize: function() {
    var m = this.getMotionCost();
    var t = this.getTempCost();
    var s = this.getSensorCost();
    var c = (m + t + s) / 500;
    
    if(this.archon.encysted) { c /= 2; }

    this.debit(c);
  },

  setButtonColor: function(temp) {
  	temp = Archonia.Axioms.clamp(temp, this.optimalTempRange.lo, this.optimalTempRange.hi);

  	var hue = Archonia.Essence.hueRange.convertPoint(temp, this.optimalTempRange);
  	var hsl = 'hsl(' + Math.floor(hue) + ', 100%, 50%)';
  	var rgb = tinycolor(hsl).toHex();
  	var tint = parseInt(rgb, 16);

  	this.archon.button.tint = tint;
  },
  
  setColors: function() {
    var t = Archonia.Cosmos.Sun.getTemperature(this.archon.position);

    this.setButtonColor(t);
  },
  
  setSize: function() {
    var m = this.getMass();
  	var p = Archonia.Essence.archonSizeRange.convertPoint(m, Archonia.Essence.archonMassRange);

  	this.archon.sprite.scale.setTo(p, p);

  	var w = this.archon.sprite.width;	// Have to tell the body to keep up with the sprite
  	this.archon.sprite.body.setSize(w, w);
  	this.archon.sprite.body.setCircle(w / 2);
  },
  
  tick: function(frameCount) {
    this.frameCount = frameCount;
    
    this.setColors();
    this.metabolize();
  }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Goo;
}
