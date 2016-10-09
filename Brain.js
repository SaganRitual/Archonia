/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Cosmos.Sun = require('./Sun.js');
  Archonia.Form.Body = require('./Body.js');
  Archonia.Form.BrainStates = require('./widgets/BrainStates.js');
  Archonia.Form.SensorArray = require('./widgets/SensorArray');
  Archonia.Form.XY = require('./widgets/XY.js').XY;
}

(function(Archonia) {
  
var howManyPointsForSpatialInputs = 12;

Archonia.Form.Brain = function(archon) {
  this.archon = archon;
  
  this.body = new Archonia.Form.Body();
  
  var gSenses = archon.genome.senses;

  this.state_searchForFood = new Archonia.Form.BrainStates.SearchForFood(this);
  this.state_findSafeTemp = new Archonia.Form.BrainStates.FindSafeTemp(this);
  
  this.currentState = 'searchForFood';

  this.movementTarget = Archonia.Form.XY();

  this.currentAction = { senseName: 'hunger', action: 'searchForFood', direction: 0, signalWeight: 0 };

  this.frameCount = 0;

  this.velocity = Archonia.Form.XY();
  
  var senseAddons = {
    fatigue:     { howManyPoints:  1, signalSpread: 1, action: 'moveToSecure' },
    food:        { howManyPoints: howManyPointsForSpatialInputs, signalSpread: 3, action: 'eat' },
    predator:    { howManyPoints: howManyPointsForSpatialInputs, signalSpread: 3, action: 'flee' },
    prey:        { howManyPoints: howManyPointsForSpatialInputs, signalSpread: 3, action: 'pursue' },
    hunger:      { howManyPoints:  1, signalSpread: 1, action: 'searchForFood' },
    temperature: { howManyPoints:  2, signalSpread: 1, action: 'findSafeTemp' },
    toxin:       { howManyPoints: howManyPointsForSpatialInputs, signalSpread: 3, action: 'toxinDefense' }
  };
  
  this.senseControls = {};
  
  for(var senseNameInGenome in gSenses) {
    this.senseControls[senseNameInGenome] = {};
    
    var gSense = gSenses[senseNameInGenome], pSense = this.senseControls[senseNameInGenome], extra = senseAddons[senseNameInGenome];
    
    for(var ee in extra) { pSense[ee] = extra[ee]; }  // Copy the extra gene-related info to the sense info

    this.senseControls[senseNameInGenome].sensorArray = new Archonia.Form.SensorArray(
      extra.howManyPoints, this.archon.genome.senseMeasurementDepth,
      gSense.decayRate, gSense.valuesRangeLo, gSense.valuesRangeHi
    );
  }
};

Archonia.Form.Brain.prototype = {
  determineMostPressingNeed: function() {
    
    var b = this.getEffectiveSignalStrengthFromSense(this.currentAction.senseName);
    
    this.currentAction.signalWeight = b.effectiveSignalStrength;
    
    var signalToBeat = this.currentAction.signalWeight + this.archon.genome.inertialDamper;
    
    for(var s in this.senseControls) {
      b = this.getEffectiveSignalStrengthFromSense(s);

      if(b.effectiveSignalStrength > signalToBeat) {

        signalToBeat = b.effectiveSignalStrength;
        
        this.currentAction.senseName = s;
        this.currentAction.signalWeight = b.effectiveSignalStrength;
        this.currentAction.action = b.action;
        this.currentAction.direction = b.direction;

      }
    }

    return this.currentAction;
  },

  getEffectiveSignalStrengthFromSense: function(senseName) {
    var brainSenseControls = this.senseControls[senseName];

    if(brainSenseControls.sensorArray.isEmpty()) { throw new Error("Sensors should never be empty"); }
  
    var genomeSenseControls = this.archon.genome.senses[senseName];
    var inputSignal = brainSenseControls.sensorArray.getBestSignal(brainSenseControls.signalSpread);
 
    return Object.assign(inputSignal, {
      effectiveSignalStrength: inputSignal.weight * genomeSenseControls.multiplier,
      action: brainSenseControls.action
    });
  },
  
  getTemperature: function() {
    return Archonia.Cosmos.Sun.getTemperature(this.archon.position);
  },
  
  launch: function() {
    
  },

  startSearchForFood: function() { this.stateAwaitingAck = true; this.searchForFood.start(); this.state = 'searchForFood'; },
  
  senseFatigue: function(where, fatigue) {
    this.senseControls.fatigue.sensorArray.store(where, fatigue);
  },
  
  senseHunger: function(where, hunger) {
    this.senseControls.hunger.sensorArray.store(where, hunger);
  },
  
  senseFood: function(where, food) {
    this.senseControls.food.sensorArray.store(where, food);
  },

  sensePredator: function(where, predator) {
    this.senseControls.predator.sensorArray.store(where, predator);
  },

  sensePrey: function(where, prey) {
    this.senseControls.prey.sensorArray.store(where, prey);
  },
  
  senseTemperature: function(where, temp) {
    this.senseControls.temperature.sensorArray.store(where, temp);
  },
  
  senseToxin: function(where, toxin) {
    this.senseControls.toxin.sensorArray.store(where, toxin);
  },
  
  tick: function(frameCount) {
    var computerizedAngle = null, robalizedAngle = null, stateInstruction = null, setMovementTarget = false;
    
    this.determineMostPressingNeed();

    this.frameCount = frameCount;
    this.state_searchForFood.update(frameCount, this.currentAction.action === 'searchForFood');
    this.state_findSafeTemp.update(frameCount, this.currentAction.action === 'findSafeTemp');

    switch(this.currentAction.action) {
    case "moveToSecure":
    case "pursue":
    case "flee":
    case "eat":
      setMovementTarget = true;
      robalizedAngle = this.currentAction.direction * (2 * Math.PI / howManyPointsForSpatialInputs);
      computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
      break;
      
    case "findSafeTemp":
      break;
      
    case'searchForFood':
      stateInstruction = this.state_searchForFood.getInstruction();
      if(stateInstruction.action !== 'continue') { this.archon.moveTo(stateInstruction.moveTo); }
      break;
      
    default:  // For all the non-spatial inputs
      robalizedAngle = 0; computerizedAngle = 0; setMovementTarget = true;
      break;
    }

    if(setMovementTarget) {
      var xy = Archonia.Form.XY.fromPolar(1, computerizedAngle);
      this.movementTarget.set(xy);
    }
  }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Brain;
}
