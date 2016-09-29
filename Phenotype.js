/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
}

(function(A) {
  
  var adultFatDensity = 100;  // 100 calories per gram
  var larvaFatDensity = 1000;
  var embryoFatDensity = 1000;

A.Phenotype = function(archon) {
  
  if(archon === undefined) {
    throw new TypeError("Phenotype needs an archon");
  }
  
  this.archon = archon;
  this.genome = archon.genome;
  this.embryoCalorieBudget = 0;
  this.larvalCalorieBudget = 0;
  this.adultCalorieBudget = 0;
  
};

A.Phenotype.Ledger = function() {
  
};

A.Phenotype.Ledger.prototype = {
  applyBenefit: function(bucket, benefit, threshold) {
    this.benefit = benefit;
    
    bucket += this.benefit;
    if(bucket > threshold) {
      this.benefit = bucket - threshold;
      bucket = threshold;
    } else {
      this.benefit = 0;
    }
    
    return bucket;
  },
  
  applyCost: function(bucket, cost) {
    this.cost = cost;
    
    bucket -= this.cost;
    if(bucket < 0) {
      this.cost = -bucket;
      bucket = 0;
    } else {
      this.cost = 0;
    }
    
    return bucket;
  },
  
  benefitRemainder: function() {
    return this.benefit;
  },
  
  costRemainder: function() {
    return this.cost;
  }
};

A.Phenotype.prototype = {
  
  reproductionCostFactor: 1.25,
  ledger: new A.Phenotype.Ledger(),
  
  breed: function() {

    var remainingReproductionCost = (
      this.genome.offspringMass.adultCalories + this.genome.offspringMass.larvalCalories
    ) * this.reproductionCostFactor;
    
    this.embryoCalorieBudget = this.ledger.applyCost(this.embryoCalorieBudget, remainingReproductionCost);
    remainingReproductionCost = this.ledger.costRemainder();
    
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
    this.larvalCalorieBudget = this.ledger.applyCost(this.larvalCalorieBudget, costInCalories);
    costInCalories = this.ledger.costRemainder();

    
    // if you're starving, you can reabsorb any embryo reserves
    // you've built up, but you don't get all the calories back

    if(costInCalories > 0 && this.embryoCalorieBudget > 0) {
      var t = costInCalories * (4 / 3);

      this.embryoCalorieBudget = this.ledger.applyCost(this.embryoCalorieBudget, t);
      costInCalories = this.ledger.costRemainder();
    }
    
    this.adultCalorieBudget = this.ledger.applyCost(this.adultCalorieBudget, costInCalories);
    costInCalories = this.ledger.costRemainder();

    if(this.adultCalorieBudget === 0) { this.die(); }
  },
  
  die: function() {
    // Dummy for talking to test harness until we have an archon to talk to
    this.archon.die();
  },

  eat: function(food) {
    var benefit = food.calories;

    this.adultCalorieBudget = this.ledger.applyBenefit(this.adultCalorieBudget, benefit, this.genome.embryoThreshold);
    benefit = this.ledger.benefitRemainder();
    
    if(benefit > 0) {
      this.embryoCalorieBudget = this.ledger.applyBenefit(this.embryoCalorieBudget, benefit, Number.MAX_VALUE);
      benefit = 0;
      
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
  
  launch: function() {
    this.larvalCalorieBudget = this.genome.birthMass.larvalCalories;
    this.adultCalorieBudget = this.genome.birthMass.adultCalories;
    
    this.setSize();
  },
  
  setSize: function() {
    var m = this.getMass();
    var s = m / A.archoniaGooDiameter;
    
    this.archon.phaseron.scale.setTo(s, s);
    
    this.archon.phaseron.body.setSize(s, s);
    this.archon.phaseron.body.setCircle(s / 2);
  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A;
}
