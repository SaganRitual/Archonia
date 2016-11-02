/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.Goo = function(archon) {
  
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "goo");
  this.state = archon.state;

  this.state.embryoCalorieBudget = 0;
  this.state.larvalCalorieBudget = 0;
  this.state.adultCalorieBudget = 0;
  
};

Archonia.Form.Goo.prototype = {
  
  applyBenefit: function(bucket, benefit, threshold) {
    this.state[bucket] += benefit;
    
    if(this.state[bucket] > threshold) { benefit = this.state[bucket] - threshold; this.state[bucket] = threshold; }
    else { benefit = 0; }
  
    return benefit;
  },

  applyCost: function(bucket, cost) {
    this.state[bucket] -= cost;
    
    if(this.state[bucket] < 0) { cost = -this.state[bucket]; this.state[bucket] = 0; }
    else { cost = 0; }
  
    return cost;
  },
  
  bePoisoned: function(poisoner) {
    // This function is the reciprocal of the eat function. Should clean up so
    // we don't have two functions doing basically the same thing
    var myTotalCalories = (
      this.state.adultCalorieBudget + this.state.embryoCalorieBudget + this.state.larvalCalorieBudget
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
    if(this.state.adultCalorieBudget > 0) {
      Archonia.Cosmos.Archonery.breed(this.state.archonUniqueId);
    }
  },
  
  debit: function(costInCalories) {
    // Use up your baby fat reserves first
    costInCalories = this.applyCost('larvalCalorieBudget', costInCalories);
    
    // if you're starving, you can reabsorb any embryo reserves
    // you've built up, but you don't get all the calories back

    if(costInCalories > 0 && this.state.embryoCalorieBudget > 0) {
      var t = costInCalories * (4 / 3);

      costInCalories = this.applyCost('embryoCalorieBudget', t);
    }
    
    costInCalories = this.applyCost('adultCalorieBudget', costInCalories);

    if(this.state.adultCalorieBudget === 0) { this.die(); }
  },
  
  die: function() { Archonia.Cosmos.Archonery.acceptSoul(this.state.archonUniqueId); },

  eat: function(food) {
    if(this.state.encysted) { return; }  // You don't gain anything while encysted
    
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

      if(this.state.embryoCalorieBudget > this.genome.reproductionThreshold) {
        this.breed();
      }
    }
  },
  
  eatArchon: function(dinner) {
    var dinnerTotalCalories = (
      dinner.goo.state.adultCalorieBudget + dinner.goo.state.embryoCalorieBudget + dinner.goo.state.larvalCalorieBudget
    ) / 60;
    
    // Prey loses a lot more from predation than the predator gains
    var whatPreyWillLose = dinnerTotalCalories * Archonia.Axioms.calorieLossRatioForPredation;
    dinner.goo.debit(whatPreyWillLose);
    
    return dinnerTotalCalories;
  },
  
  getMass: function() {
    return Archonia.Essence.getArchonMass(this.state);
  },
  
  getMotionCost: function() {
    return this.getMass() * (this.genome.maxMVelocity / 10) + (this.genome.maxMAcceleration / 3);
  },
  
  getSensorCost: function() { return 15 * this.genome.sensorScale / Archonia.Axioms.standardSensorScale; },

  getTempCost: function() {
    return Archonia.Essence.getTempCost(this.state.position, this.getMass(), this.genome.optimalTemp, this.genome.tempRange);
  },
  
  howHungryAmI: function() {
    return (this.genome.reproductionThreshold - this.state.embryoCalorieBudget) * this.genome.hungerToleranceFactor;
  },
  
  launch: function() {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
    
    this.state.larvalCalorieBudget = this.genome.birthMassLarvalCalories;
    this.state.adultCalorieBudget = this.genome.birthMassAdultCalories;

    if(this.genome.optimalTempLo >= this.genome.optimalTempHi) {
      Archonia.Essence.hurl(
        new Archonia.Essence.BirthDefect(
          "optimalTempLo " + this.genome.optimalTempLo + ", optimalTempHi " + this.genome.optimalTempHi
        )
      );
    }
    
    this.optimalTempRange = new Archonia.Form.Range(this.genome.optimalTempLo, this.genome.optimalTempHi);
    
  },
  
  metabolize: function() {
    var m = this.getMotionCost();
    var t = this.getTempCost();
    var s = this.getSensorCost();
    var c = (m + t + s) / 500;
    
    if(this.state.encysted) { c /= 2; }

    this.debit(c);
  },
  
  tick: function(frameCount) {
    this.frameCount = frameCount;
    
    this.metabolize();
  }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Goo;
}
