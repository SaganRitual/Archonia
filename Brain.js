/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  // No point in mocking up the lowest-level stuff
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.XY = require('./widgets/XY.js').XY;

  if(process.env.BrainStates === undefined) { process.env.BrainStates = './test/support/mockBrainStates.js'; }
  if(process.env.SensorArray === undefined) { process.env.SensorArray = './test/support/mockSensorArray.js'; }
  
  Archonia.Form.BrainStates = require(process.env.BrainStates);
  Archonia.Form.SensorArray = require(process.env.SensorArray);
}

(function(Archonia) {

Archonia.Form.Brain = function(archon) {
  this.archon = archon;
  
  this.state_searchForFood = new Archonia.Form.BrainStates.SearchForFood(this);
  this.state_findSafeTemp = new Archonia.Form.BrainStates.FindSafeTemp(this);

  this.currentAction = { senseName: 'hunger', action: 'searchForFood', direction: 0, signalWeight: 0 };

  this.frameCount = 0;

  this.velocity = Archonia.Form.XY();
  
  this.sensesPhenotype = {
    food:        { howManyPoints: Archonia.Axioms.howManyPointsForSpatialInputs, signalSpread: 3, action: 'eat' },
    predator:    { howManyPoints: Archonia.Axioms.howManyPointsForSpatialInputs, signalSpread: 3, action: 'flee' },
    prey:        { howManyPoints: Archonia.Axioms.howManyPointsForSpatialInputs, signalSpread: 3, action: 'pursue' },
    hunger:      { howManyPoints: Archonia.Axioms.howManyPointsForNonSpatialInputs, signalSpread: 1, action: 'searchForFood' },
    temperature: { howManyPoints: Archonia.Axioms.howManyPointsForTemperatureInputs, signalSpread: 1, action: 'findSafeTemp' },
    toxin:       { howManyPoints: Archonia.Axioms.howManyPointsForSpatialInputs, signalSpread: 3, action: 'toxinDefense' }
  };
};

Archonia.Form.Brain.prototype = {
  determineMostPressingNeed: function() {
    
    var b = this.getEffectiveSignalStrengthFromSense(this.currentAction.senseName);
    
    this.currentAction.signalWeight = b.effectiveSignalStrength;
    
    var signalToBeat = this.currentAction.signalWeight + this.archon.genome.inertialDamper;
    
    for(var s in this.sensesPhenotype) {
      b = this.getEffectiveSignalStrengthFromSense(s);

      if(
        // If the sense we're checking is not the sense that we're currently responding
        // to, then the sense we're checking has to beat the damping threshold. If it
        // is the sense we're currently responding to, then we just update the current
        // action stuff. This is because we need to update the direction even if the
        // signal strength hasn't changed, or if it has decreased
        (b.effectiveSignalStrength > signalToBeat) || (s === this.currentAction.senseName)
      ) {

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
    var brainSenseControls = this.sensesPhenotype[senseName];

    if(brainSenseControls.sensorArray.isEmpty()) { throw new Error("Sensors should never be empty"); }
  
    var genomeSenseControls = this.archon.genome[senseName];
    var inputSignal = brainSenseControls.sensorArray.getBestSignal(brainSenseControls.signalSpread);
 
    var ret = Object.assign(inputSignal, {
      effectiveSignalStrength: inputSignal.weight * genomeSenseControls.multiplier,
      action: brainSenseControls.action
    });
    
    return ret;
  },
  
  launch: function() {
    for(var senseName in this.sensesPhenotype) {
      var senseInPhenotype = this.sensesPhenotype[senseName],
          senseInGenotype = this.archon.genome[senseName];

      senseInPhenotype.sensorArray = new Archonia.Form.SensorArray(
        senseInPhenotype.howManyPoints, this.archon.genome.senseMeasurementDepth,
        senseInGenotype.decayRate, senseInGenotype.valuesRangeLo, senseInGenotype.valuesRangeHi
      );
    }
  },
  
  senseHunger: function(where, hunger) {
    this.sensesPhenotype.hunger.sensorArray.store(where, hunger);
  },
  
  senseFood: function(where, food) {
    this.sensesPhenotype.food.sensorArray.store(where, food);
  },

  sensePredator: function(where, predator) {
    this.sensesPhenotype.predator.sensorArray.store(where, predator);
  },

  sensePrey: function(where, prey) {
    this.sensesPhenotype.prey.sensorArray.store(where, prey);
  },
  
  senseTemperature: function(where, temp) {
    this.sensesPhenotype.temperature.sensorArray.store(where, temp);
  },
  
  senseToxin: function(where, toxin) {
    this.sensesPhenotype.toxin.sensorArray.store(where, toxin);
  },
  
  processFoodSearchInstruction: function() {
    var stateInstruction = this.state_searchForFood.getInstruction();
    
    if(stateInstruction.action === 'continue') {
      if(this.archon.mVelocity.getMagnitude() === 0) {
        stateInstruction.dVelocity =
          Archonia.Axioms.computerizeAngle(Archonia.Axioms.realInRange(0, 2 * Math.PI));
        
        stateInstruction.setMovementTarget = true;
      } else {
        // Got continue, and we're already moving;
        // do nothing so we'll keep going in a
        // straight line until the state tells us to turn
        stateInstruction.setMovementTarget = false;
      }
    } else {
      // State is telling us to turn, and has given
      // us an angle. Just use it as is
      stateInstruction.setMovementTarget = true;
    }
    
    return stateInstruction;
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
    case 'toxinDefense':
      setMovementTarget = true;
      robalizedAngle = this.currentAction.direction * (2 * Math.PI / Archonia.Axioms.howManyPointsForSpatialInputs);
      computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
      break;
      
    case "findSafeTemp":
      stateInstruction = this.state_findSafeTemp.getInstruction();
      if(stateInstruction.action === 'move') {
        setMovementTarget = true;
        robalizedAngle = (this.currentAction.direction * Math.PI) + (Math.PI / 2);
        computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
      } else {
        this.archon.setMVelocity(0);
      }
      break;
      
    case'searchForFood':
      stateInstruction = this.processFoodSearchInstruction();
      computerizedAngle = stateInstruction.dVelocity;
      setMovementTarget = stateInstruction.setMovementTarget;
      break;
      
    default:  // For all the non-spatial inputs
      robalizedAngle = 0; computerizedAngle = 0;
      break;
    }

    if(setMovementTarget) {
      var xy = Archonia.Form.XY.fromPolar(this.archon.genome.maxMVelocity, computerizedAngle);
      this.archon.setMVelocity(xy);
    }
  }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Brain;
}
