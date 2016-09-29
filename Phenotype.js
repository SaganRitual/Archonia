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
    throw new TypeError("Phenotype needs a genome");
  }
  
  this.archon = archon;
  this.genome = archon.genome;
  this.embryoCalorieBudget = 0;
  this.larvalCalorieBudget = 0;
  this.adultCalorieBudget = 0;
  
};

A.Phenotype.prototype = {
  
  reproductionCostFactor: 1.25,
  
  breed: function() {
    var remainingReproductionCost = (
      this.genome.offspringMass.adultCalories + this.genome.offspringMass.larvalCalories
    ) * this.reproductionCostFactor;
    
    this.embryoCalorieBudget -= remainingReproductionCost;
    
    if(this.embryoCalorieBudget < 0) {
      remainingReproductionCost = -this.embryoCalorieBudget;
    } else {
      remainingReproductionCost = 0;
    }
    
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
    if(this.larvalCalorieBudget > 0) {
      this.larvalCalorieBudget -= costInCalories;
      
      if(this.larvalCalorieBudget < 0) { costInCalories = -this.larvalCalorieBudget; }
    }
    
    // if you're starving, you can reabsorb any embryo reserves
    // you've built up, but you don't get all the calories back
    if(costInCalories > 0 && this.embryoCalorieBudget > 0) {
      this.embryoCalorieBudget *= 0.75;
      this.embryoCalorieBudget -= costInCalories;
      
      if(this.embryoCalorieBudget < 0) { costInCalories = -this.embryoCalorieBudget; }
    }
    
    this.adultCalorieBudget -= costInCalories;
      
    if(this.adultCalorieBudget < 0) { this.die(); }
    
  },

  eat: function(food) {
    var benefit = food.calories;

    this.adultCalorieBudget += benefit;
    
    if(this.adultCalorieBudget > this.genome.embryoThreshold) {

      benefit = this.adultCalorieBudget - this.genome.embryoThreshold;

      this.adultCalorieBudget = this.genome.embryoThreshold;
      
      if(benefit > 0) {
        this.embryoCalorieBudget += benefit;
        benefit = 0;
      }
      
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
    this.width = this.archon.phaseron.width;
    this.radius = this.width / 2;
    
    this.archon.phaseron.body.setSize(this.width, this.width);
    this.archon.phaseron.body.setCircle(this.radius);
  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A;
}