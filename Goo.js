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
    if(this.archon.encysted) { return; }
    
    var benefit = null;
    
    if(food instanceof Archonia.Form.Archon) {
      var whatIWillTryToTake = this.genome.calorieGainToAttemptFromPredation / 60;
      
      benefit = Math.min(
        whatIWillTryToTake,
        food.goo.adultCalorieBudget + food.goo.embryoCalorieBudget + food.goo.larvalCalorieBudget
      );
      
      // Prey loses a lot more from predation than the predator gains
      var whatPreyWillLose = whatIWillTryToTake * Archonia.Axioms.calorieLossRatioForPredation;
      food.goo.debit(whatPreyWillLose);
      
    } else {
      benefit = food.calories;
    }

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
    return this.getMass() * (this.genome.maxMVelocity / 8) + (this.genome.maxMAcceleration / 6);
  },
  
  getSensorCost: function() { return 10 * this.genome.sensorScale / Archonia.Axioms.standardSensorScale; },

  getTempCost: function() {
    var t = Archonia.Cosmos.Sun.getTemperature(this.archon.position);
    var d = Math.abs(t - this.genome.optimalTemp);
    var s = this.getMass();
    var p = Math.log((d || 1) + 1) * Math.log(s + 1);

    var r = null;
    if(this.genome.tempRange > Archonia.Axioms.standardArchonTempRange) {
      r = 5 * Archonia.Axioms.standardArchonTempRange / this.genome.tempRange;
    } else {
      r = 5 * this.genome.tempRange / Archonia.Axioms.standardArchonTempRange;
    }

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
