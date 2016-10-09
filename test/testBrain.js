var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

Archonia.Axioms = require('../Axioms.js');
Archonia.Form.Brain = require('../Brain.js');
Archonia.Form.XY = require('../widgets/XY.js').XY;

var testData = require('./support/testBrain-data.js');
var archon = new testData.Archon();

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

var frameCount = 0;
var tick = function(theBrain) { theBrain.tick(frameCount++); };

var foodSearchToFirstTurn = function(brain, archon) {
  var temp = archon.genome.optimalTemp;
  var food = 50;

  var fullness = 0; // Low fullness; extremely hungry
  rampSensorsDirectional(brain, 'hunger', [ fullness ]);

  rampSensorsDirectional( brain, 'temperature', [ temp, temp ] );
  rampSensorsDirectional( brain, 'food', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'fatigue',  [ 0 ] );
  rampSensorsDirectional( brain, 'predator', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'prey',     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

  // hack some ugliness into our velocity, so we can tell that
  // the brain is setting the velocity to something reasonable. We
  // can't check for fixed values because starting from stationary
  // sets us in a random direction
  archon.velocity.set('garbage', 'garbage');
  tick(brain);

  chai.expect(archon.velocity).to.have.property('x').that.is.a('number');
  chai.expect(archon.velocity).to.have.property('y').that.is.a('number');

  // Now we have some fixed values in the velocity, check that they remain
  // the same until the genome says it's time to turn
  var x = archon.velocity.x, y = archon.velocity.y;

  // but first, hack some garbage in again, because the brain should not
  // be setting the velocity again until the genome says it's time to
  // turn. Make sure he's not setting it
  archon.velocity.set('garbage', 'garbage');
  tick(brain);

  chai.expect(archon.velocity).to.include({ x: 'garbage', y: 'garbage' });

  archon.velocity.set(x, y);

  for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns - 1; i++) {
    tick(brain);
    chai.expect(archon.velocity).to.include({ x: x, y: y });
  }

  computerizedAngle = archon.velocity.getAngleFrom(0);

  // First turn is always left, add 7π/6
  robalizedAngle = Archonia.Axioms.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6);

  computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
  var xy = Archonia.Form.XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);

  tick(brain);
  chai.expect(archon.velocity).to.include({ x: xy.x, y: xy.y });
};

var safeTempSearch = function(brain, archon) {
  var temp = archon.genome.optimalTemp;
  var food = 50;

  var fullness = archon.genome.reproductionThreshold + archon.genome.embryoThreshold;
  var computerizedAngle = null, xy = null;
  
  rampSensorsDirectional(brain, 'hunger', [ fullness ]);

  rampSensorsDirectional( brain, 'temperature', [ temp, temp ] );
  rampSensorsDirectional( brain, 'food', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'fatigue',  [ 0 ] );
  rampSensorsDirectional( brain, 'predator', [ 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'prey',     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
  rampSensorsDirectional( brain, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

  // Make sure we're not getting tempSearch when we're
  // supposed to be fleeing a predator
  process.env['Sun.getTemperature'] = temp; // So the state will see that the temp is ok
  tick(brain);
  
  // Should choose position #2, the center of the spread
  computerizedAngle = Archonia.Axioms.computerizeAngle(5 * (2 * Math.PI / 12));
  xy = Archonia.Form.XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);
  chai.expect(archon.velocity).to.include({ x: xy.x, y: xy.y });

  // End predator threat, make temp too hi
  for(var i = 0; i < archon.genome.senseMeasurementDepth; i++) {
    rampSensorsDirectional( brain, 'predator', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
    rampSensorsDirectional( brain, 'temperature', [ temp, temp  + archon.genome.optimalTempRange ] );
  }
  
  // Temp too high below, go up
  process.env['Sun.getTemperature'] = temp  + archon.genome.optimalTempRange;

  tick(brain);
  chai.expect(archon.velocity.x).within(-1e-5, 1e-5);
  chai.expect(archon.velocity.y).equal(archon.genome.maxMVelocity);

  // Temp too high above, go down
  for(var i = 0; i < archon.genome.senseMeasurementDepth - 1; i++) {
    rampSensorsDirectional( brain, 'temperature', [ temp  + archon.genome.optimalTempRange, temp ] );
  }
  
  process.env['Sun.getTemperature'] = temp  + archon.genome.optimalTempRange;

  tick(brain);
  chai.expect(archon.velocity.x).within(-1e-5, 1e-5);
  chai.expect(archon.velocity.y).equal(-archon.genome.maxMVelocity);
  
  // Should continue move until we reach the time limit; here we
  // go until just before that limit; velocity should not change
  //
  // Ok, sloppy here about the exact number of ticks and the order,
  // but it doesn't matter if we're off by a couple; the main thing
  // is to change direction when necessary
  process.env['Sun.getTemperature'] = temp  + archon.genome.optimalTempRange;

  for(var j = 0; j < archon.genome.howLongBadTempToEncystment - 2; j++) {
    tick(brain);
    chai.expect(archon.velocity.x).within(-1e-5, 1e-5);
    chai.expect(archon.velocity.y).equal(-archon.genome.maxMVelocity);
  }

  // Now bring temp back to normal and raise another threat; temp state should tell
  // the brain that temp is ok, brain should turn it off and take care of the new threat
  for(var i = 0; i < archon.genome.senseMeasurementDepth; i++) {
    rampSensorsDirectional( brain, 'toxin',    [ 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1 ] );
    rampSensorsDirectional( brain, 'temperature', [ temp, temp ] );
  }

  process.env['Sun.getTemperature'] = temp;

  tick(brain);
  computerizedAngle = Archonia.Axioms.computerizeAngle(11 * (2 * Math.PI / 12));
  xy = Archonia.Form.XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);
  chai.expect(archon.velocity).to.include({ x: xy.x, y: xy.y });
};

describe('Brain', function() {
  describe('Inertia threshold / change damping', function() {
    it('#no state change until threshold met', function() {
      archon.genome.inertialDamper = 0.02;

      var b = new Archonia.Form.Brain(archon), r = null;
      
      for(var s in archon.genome.senses) { archon.genome.senses[s].multiplier = 1; }
      
      // Ramp everyone up; fatigue should win this round
      for(var i = 0; i < archon.genome.senseMeasurementDepth; i++) {
        rampSensors(b, 'fatigue', 0.89, 1);
        rampSensors(b, 'hunger', archon.genome.embryoThreshold + archon.genome.reproductionThreshold, 1);
        rampSensors(b, 'temperature', archon.genome.optimalTemp, 2);
        rampSensors(b, 'predator', 0.6, 12);
        rampSensors(b, 'prey', 0.8, 12);
        rampSensors(b, 'toxin', 0.8, 12);
        rampSensors(b, 'food', 75, 12);

        tick(b);
        
        // Brain wants to go to point 0 on the sensor array; that's (maxMVelocity, 0) on the x/y plane
        chai.expect(archon.velocity).to.include({ x: archon.genome.maxMVelocity, y: 0 });

        r = b.determineMostPressingNeed();
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

      tick(b);
      chai.expect(archon.velocity).to.include({ x: archon.genome.maxMVelocity, y: 0 });

      r = b.determineMostPressingNeed();
      chai.expect(r).to.include({ action: 'moveToSecure', direction: 0});
      
      // Should happen on this round
      rampSensors(b, 'fatigue', 0, 1);
      rampSensors(b, 'hunger', archon.genome.embryoThreshold + archon.genome.reproductionThreshold, 1);
      rampSensors(b, 'temperature', archon.genome.optimalTemp, 2);
      rampSensors(b, 'predator', 0.9, 12);
      rampSensors(b, 'prey', 0.2, 12);
      rampSensors(b, 'toxin', 0.5, 12);
      rampSensors(b, 'food', 50, 12);

      tick(b);
      chai.expect(archon.velocity).to.include({ x: archon.genome.maxMVelocity, y: 0 });

      r = b.determineMostPressingNeed();
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
      
      var r = b.determineMostPressingNeed();
      chai.expect(r).to.include({ action: 'eat', direction: 11 });

      rampSensorsDirectional( b, 'temperature', [ temp, temp + archon.genome.optimalTempRange ] );
      
      var r = b.determineMostPressingNeed();
      chai.expect(r).to.include({ action: 'findSafeTemp', direction: 1 });

      rampSensorsDirectional( b, 'fatigue',  [ 1 ] );
      rampSensorsDirectional( b, 'fatigue',  [ 1 ] );

      var r = b.determineMostPressingNeed();
      chai.expect(r).to.include({ action: 'moveToSecure', direction: 0 });
    });
  });

  describe('Movement instructions to body', function() {
    it('#calculate movement target from sensor input', function() {
      var b = new Archonia.Form.Brain(archon), r = null;

      // high fullness -- not hungry at all
      var fullness = archon.genome.embryoThreshold + archon.genome.reproductionThreshold;
      var temp = archon.genome.optimalTemp;
      var food = 50;
      
      rampSensorsDirectional(b, 'hunger', [ fullness ]);

      rampSensorsDirectional( b, 'temperature', [ temp, temp ] );
      rampSensorsDirectional( b, 'food', [ food, 0, 0, 0, food, 0, food, 0, food, 0, food, food ] );
      rampSensorsDirectional( b, 'fatigue',  [ 0 ] );
      rampSensorsDirectional( b, 'predator', [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'prey',     [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
      rampSensorsDirectional( b, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );

      tick(b);

      var theta = Archonia.Axioms.computerizeAngle(11 * (2 * Math.PI / 12));
      var xy = Archonia.Form.XY.fromPolar(archon.genome.maxMVelocity, theta)
      
      chai.expect(archon.velocity).to.include({ x: xy.x, y: xy.y });
    });
  });
  
  describe('#SearchForFood state', function() {
    it('#start of search to first turn -- left', function() {
      var archon = new testData.Archon();
      var brain = new Archonia.Form.Brain(archon);
      
      foodSearchToFirstTurn(brain, archon);
    });
  
    it('#first turn to second -- right', function() {
      var archon = new testData.Archon();
      var brain = new Archonia.Form.Brain(archon);
      
      foodSearchToFirstTurn(brain, archon);

      computerizedAngle = archon.velocity.getAngleFrom(0);

      // Right turn, subtract 7π/6
      robalizedAngle = Archonia.Axioms.robalizeAngle(computerizedAngle) - (7 * Math.PI / 6);

      computerizedAngle = Archonia.Axioms.computerizeAngle(robalizedAngle);
      var xy = Archonia.Form.XY(Archonia.Form.XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle));

      for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns; i++) {
        tick(brain);
      }

      tick(brain);
      chai.expect(archon.velocity).to.include({ x: xy.x, y: xy.y });
    });
  });

  describe('#FindSafeTemp state', function() {
    it("#track until not needed", function() {
      var archon = new testData.Archon();
      var brain = new Archonia.Form.Brain(archon);
      safeTempSearch(brain, archon);
    });
  
    it('#temp not getting any better: encyst', function() {
      var archon = new testData.Archon();
      var brain = new Archonia.Form.Brain(archon);
      safeTempSearch(brain, archon);

      for(var i = 0; i < archon.genome.senseMeasurementDepth; i++) {
        rampSensorsDirectional( brain, 'toxin',    [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ] );
        rampSensorsDirectional(
          brain, 'temperature', [ archon.genome.optimalTemp, archon.genome.optimalTemp + archon.genome.optimalTempRange ]
        );
      }

      process.env['Sun.getTemperature'] = archon.genome.optimalTemp + archon.genome.optimalTempRange;

      for(var i = 0; i < archon.genome.howLongBadTempToEncystment; i++) {
        tick(brain);
        chai.expect(archon.velocity.x).within(-1e-5, 1e-5);
        chai.expect(archon.velocity.y).equal(archon.genome.maxMVelocity);
      }

      tick(brain);
      chai.expect(archon.velocity).to.include({ x: 0, y: 0 });
    });
  })
});
