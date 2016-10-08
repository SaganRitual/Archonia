var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

Archonia.Axioms = require('../Axioms.js');
Archonia.Form.Brain = require('../Brain.js');
Archonia.Form.XY = require('../widgets/XY.js').XY;

var testData = require('./support/testBrain-data.js');
var archon = testData.archon;

var data_driven = require('data-driven');
var chai = require('chai');

var rampSensors = function(brain, sense, value, howManyMeasurementPoints) {
  var fn = 'sense' + sense.substr(0, 1).toUpperCase() + sense.substr(1);
  
  for(var i = 0; i < howManyMeasurementPoints; i++) {
    brain[fn](i, value);
  }
};

var rampSensorsDirectional = function(brain, sense, values) {
  var fn = 'sense' + sense.substr(0, 1).toUpperCase() + sense.substr(1);
  
  if(Array.isArray(values)) {
    for(var i = 0; i < values.length; i++) {
      brain[fn](i, values[i]);
    }
  } else {
    brain[fn](0, values);
  }
};

describe('Brain', function() {
  describe('Inertia threshold / change damping', function() {
    it('#no state change until threshold met', function() {
      archon.genome.inertialDamper = 0.02;

      var b = new Archonia.Form.Brain(archon), r = null;
      
      for(var s in archon.genome.senses) { archon.genome.senses[s].multiplier = 1; }
      
      // Ramp everyone up; fatigue should win this round
      for(var i = 0; i < 5; i++) {
        rampSensors(b, 'fatigue', 0.89, 1);
        rampSensors(b, 'hunger', archon.genome.embryoThreshold + archon.genome.reproductionThreshold, 1);
        rampSensors(b, 'temperature', archon.genome.optimalTemp, 2);
        rampSensors(b, 'predator', 0.6, 12);
        rampSensors(b, 'prey', 0.8, 12);
        rampSensors(b, 'toxin', 0.8, 12);
        rampSensors(b, 'food', 75, 12);

        b.tick();
        
        // Brain wants to go to point 0 on the sensor array; that's (1, 0) on the x/y plane
        chai.expect(b.movementTarget).to.include({ x: 1, y: 0 });

        r = b.chooseAction();
        chai.expect(r).to.include({ action: 'moveToSecure', direction: 0});
      }
      
      // Let fatigue decay while the others continue up; nothing should
      // change until someone gets past fatigue plus the inertial damper.
      // Shouldn't happen on this round
      rampSensors(b, 'fatigue', 0, 1);
      rampSensors(b, 'hunger', archon.genome.embryoThreshold + archon.genome.reproductionThreshold, 1);
      rampSensors(b, 'temperature', archon.genome.optimalTemp, 2);
      rampSensors(b, 'predator', 0.9, 12);
      rampSensors(b, 'prey', 0.2, 12);
      rampSensors(b, 'toxin', 0.5, 12);
      rampSensors(b, 'food', 50, 12);

      b.tick();
      chai.expect(b.movementTarget).to.include({ x: 1, y: 0 });

      r = b.chooseAction();
      chai.expect(r).to.include({ action: 'moveToSecure', direction: 0});
      
      // Should happen on this round
      rampSensors(b, 'fatigue', 0, 1);
      rampSensors(b, 'hunger', archon.genome.embryoThreshold + archon.genome.reproductionThreshold, 1);
      rampSensors(b, 'temperature', archon.genome.optimalTemp, 2);
      rampSensors(b, 'predator', 0.9, 12);
      rampSensors(b, 'prey', 0.2, 12);
      rampSensors(b, 'toxin', 0.5, 12);
      rampSensors(b, 'food', 50, 12);

      b.tick();
      chai.expect(b.movementTarget).to.include({ x: 1, y: 0 });

      r = b.chooseAction();
      chai.expect(r).to.include({ action: 'toxinDefense', direction: 0});
    });
  });
  
  describe('Spread averaging', function() {
    it('#size 1 for temp, 3 for other spatial, 1 for non-spatial', function() {
      var b = new Archonia.Form.Brain(archon), r = null;
      
      var hunger = archon.genome.embryoThreshold + archon.genome.reproductionThreshold;
      var temp = archon.genome.optimalTemp;
      var food = 50;
      
      rampSensorsDirectional(b, 'hunger', [ hunger ]);

      rampSensorsDirectional( b, 'temperature', [ temp, temp ] );
      rampSensorsDirectional( b, 'food', [ food, 0, 0, 0, food, 0, food, 0, food, 0, food, food ] );
      rampSensorsDirectional( b, 'fatigue',  [ 0 ] );
      rampSensorsDirectional( b, 'predator', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'prey',     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      
      var r = b.chooseAction();
      chai.expect(r).to.include({ action: 'eat', direction: 11 });

      rampSensorsDirectional( b, 'temperature', [ temp, temp + archon.genome.optimalTempRange ] );
      
      var r = b.chooseAction();
      chai.expect(r).to.include({ action: 'findSafeTemp', direction: 1 });

      rampSensorsDirectional( b, 'fatigue',  [ 1 ] );
      
      var r = b.chooseAction();
      chai.expect(r).to.include({ action: 'moveToSecure', direction: 0 });
    });
  });

  describe('Movement instructions to body', function() {
    it('#calculate movement target from sensor input', function() {
      var b = new Archonia.Form.Brain(archon), r = null;
      
      var hunger = archon.genome.embryoThreshold + archon.genome.reproductionThreshold;
      var temp = archon.genome.optimalTemp;
      var food = 50;
      
      rampSensorsDirectional(b, 'hunger', [ hunger ]);

      rampSensorsDirectional( b, 'temperature', [ temp, temp ] );
      rampSensorsDirectional( b, 'food', [ food, 0, 0, 0, food, 0, food, 0, food, 0, food, food ] );
      rampSensorsDirectional( b, 'fatigue',  [ 0 ] );
      rampSensorsDirectional( b, 'predator', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'prey',     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

      b.tick();

      var r = b.chooseAction(), theta = Archonia.Axioms.computerizeAngle(11 * (2 * Math.PI / 12));
      
      chai.expect(r).to.include({ action: 'eat', direction: 11 });
      chai.expect(b.movementTarget).to.include(Archonia.Form.XY.fromPolar(1, theta));
    });
  });

});
