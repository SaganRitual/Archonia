var A = require('../Archonia.js');

var testData = require('./support/testBrain-data.js');
var archon = testData.archon;

A.prePhaserSetup();

var data_driven = require('data-driven');
var chai = require('chai');

var loadBrainWithMockups = function() {
    A.Brain = require('../Brain.js');
    A.SensorArray = require('./support/mockSensorArray.js');
};

var loadBrainWithRealSensors = function() {
  A.Brain = require('../Brain.js');
  A.SensorArray = require('../widgets/SensorArray.js');
};

var simulateBrain = function(whichSense) {
  // Because mocha runs the tests in whichever order it likes
  if(A.Brain === undefined) { loadBrainWithMockups(); }
  
  var b = new A.Brain(archon), senseName = null, sensorArrays = {};

  for(senseName in archon.genome.senses) {
    var fn = 'sense' + senseName.substr(0, 1).toUpperCase() + senseName.substr(1);
    var callback = function(which) { sensorArrays[senseName] = which; };
    
    b[fn](-1, callback);
  }
  
  // Now we know which sensor array is which; tell each array
  // what to return when the brain asks for their signal info
  // Set all of them to return zero, then we'll set the one under
  // scrutiny to return non-zero and a direction
  for(senseName in sensorArrays) {
    sensorArray = sensorArrays[senseName];
    
    sensorArray.store(-2, { weight: 0, direction: 0 });
  }
  
  sensorArrays[whichSense].store(-2, { weight: 1, direction: 0 });
  
  return b.chooseAction();
};

var simulateCompetition = function(testInfo) {
  // Because mocha runs the tests in whichever order it likes
  if(A.Brain === undefined) { loadBrainWithMockups(); }
  
  var b = new A.Brain(archon), senseName = null, sensorArrays = {};

  for(senseName in archon.genome.senses) {
    var fn = 'sense' + senseName.substr(0, 1).toUpperCase() + senseName.substr(1);
    var callback = function(which) { sensorArrays[senseName] = which; };
    
    b[fn](-1, callback);
  }
  
  // Now we know which sensor array is which; tell each array
  // what to return when the brain asks for their signal info
  // Set all of them to return zero, then we'll set the one under
  // scrutiny to return non-zero and a direction
  for(senseName in sensorArrays) {
    sensorArray = sensorArrays[senseName];
    
    sensorArray.store(-2, { weight: 0, direction: 0 });
    archon.genome.senses[senseName].multiplier = 1;
  }
  
  if(testInfo.winnerMultiplier === undefined) {
    sensorArrays[testInfo.sense].store(-2, { weight: 2, direction: 0, multiplier: 1 });
  } else {
    archon.genome.senses[testInfo.sense].multiplier = testInfo.winnerMultiplier;
    sensorArrays[testInfo.sense].store(-2, { weight: 2, direction: 0, multiplier: archon.genome.senses[testInfo.sense].multiplier });

    archon.genome.senses[testInfo.loser].multiplier = testInfo.loserMultiplier;
    sensorArrays[testInfo.loser].store(-2, { weight: 1, direction: 0,  multiplier: archon.genome.senses[testInfo.loser].multiplier });
  }
  
  return b.chooseAction();
};

var rampSensors = function(brain, sense, value, howManyMeasurementPoints) {
  var fn = 'sense' + sense.substr(0, 1).toUpperCase() + sense.substr(1);
  
  for(var i = 0; i < howManyMeasurementPoints; i++) {
    brain[fn](i, value);
  }
};

describe('Brain', function() {
  describe('Smoke test', function() {
    describe('#module exists', function() {
      it("#require shouldn't complain", function() {
        chai.expect(loadBrainWithMockups).to.not.throw();
        chai.expect(A).to.have.property('Brain');
      });
    });
    
    describe('#object exists', function() {
      it('#should look like a constructor', function() {
        chai.assert.typeOf(A.Brain, "Function");
      });
    });
  
    describe('#public functions exist', function() {
      var functionNames = [
        { functionName: 'chooseAction' }, { functionName: 'launch' }, { functionName: 'sensePredator' },
        { functionName: 'sensePrey' }, { functionName: 'senseFood' }, { functionName: 'senseHunger' },
        { functionName: 'senseTemperature' }, { functionName: 'senseToxin' }
      ];

      data_driven(functionNames, function() {
        it('#{functionName}()', function(nameObject) {
          var c = new A.Brain(archon);
          chai.expect(c).to.have.property(nameObject.functionName);
          chai.assert.isFunction(c[nameObject.functionName]);
        });
      });
    });
  });
  
  describe('Rudimentary decision making per sense', function() {
    var testInfo = [
      { sense: 'fatigue'     , action: 'moveToSecure',  direction: 0 },
      { sense: 'food'        , action: 'eat',           direction: 0 },
      { sense: 'predator'    , action: 'flee',          direction: 0 },
      { sense: 'prey'        , action: 'pursue',        direction: 0 },
      { sense: 'hunger'      , action: 'searchForFood', direction: 0 },
      { sense: 'temperature' , action: 'findSafeTemp',  direction: 0 },
      { sense: 'toxin'       , action: 'toxinDefense',  direction: 0 }
    ];
    
    data_driven(testInfo, function() {
      it('#{sense}', function(oneSenseTest) {
        var result = simulateBrain(oneSenseTest.sense);
        chai.expect(result).to.include({ action: oneSenseTest.action, direction: oneSenseTest.direction });
      });
    });
  })
  
  describe('Competing senses, equal genome multipliers', function() {
    var testInfo = [
      { sense: "fatigue", loser: "food", action: 'moveToSecure', direction: 0 },
      { sense: "food", loser: "predator", action: 'eat', direction: 0 },
      { sense: "predator", loser: "prey", action: 'flee', direction: 0 },
      { sense: "prey", loser: "hunger", action: 'pursue', direction: 0 },
      { sense: "hunger", loser: "temperature", action: 'searchForFood', direction: 0 },
      { sense: "temperature", loser: "toxin", action: 'findSafeTemp', direction: 0 },
      { sense: "toxin", loser: "fatigue", action: 'toxinDefense', direction: 0 }
    ];
    
    data_driven(testInfo, function() {
      it("#{sense} vs {loser}, former wins", function(oneSenseTest) {
        var result = simulateCompetition(oneSenseTest);
        chai.expect(result).to.include({ action: oneSenseTest.action, direction: oneSenseTest.direction });
      });
    });
  });
  
  describe('Competing senses with differing genome multipliers', function() {
    // These multipliers will make the winner and loser trade places
    var testInfo = [
      { sense: "fatigue", loser: "food", action: 'eat', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "food", loser: "predator", action: 'flee', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "predator", loser: "prey", action: 'pursue', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "prey", loser: "hunger", action: 'searchForFood', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "hunger", loser: "temperature", action: 'findSafeTemp', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "temperature", loser: "toxin", action: 'toxinDefense', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 },
      { sense: "toxin", loser: "fatigue", action: 'moveToSecure', direction: 0, winnerMultiplier: 1, loserMultiplier: 3 }
    ];
    
    data_driven(testInfo, function() {
      it('#{sense} vs {loser}, latter wins', function(oneSenseTest) {
        var result = simulateCompetition(oneSenseTest);
        chai.expect(result).to.include({ action: oneSenseTest.action, direction: oneSenseTest.direction });
      });
    });
  });
  
  describe('Inertia threshold / change damping', function() {
    it('#no state change until threshold met', function() {
      loadBrainWithRealSensors();
      archon.genome.inertialDamper = 0.02;

      var b = new A.Brain(archon), r = null;
      
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

      r = b.chooseAction();
      chai.expect(r).to.include({ action: 'toxinDefense', direction: 0});
    });
  });
});
