var A = require('../Archonia.js');
A.Ramper = require('../Ramper.js');
A.Rounder = require('../Rounder.js');

A.prePhaserSetup();

A.integerInRange = function(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
};

var chai = require('chai');

var archon = {
  genome: {
    optimalTemp: 0, optimalTempRange: 1, 
    offspringMass: { adultCalories: 100, larvalCalories: 100 },
    reproductionThreshold: 500, embryoThreshold: 200,
    senseMeasurementDepth: 10,
    senses: {}
  }
};

var reproductionCostFactor = 1.25;

var senseNames = [ 'fatigue', 'food', 'inertia', 'predators', 'prey', 'hunger', 'temperature', 'toxins' ];

for(var i = 0; i < senseNames.length; i++) {
  var name = senseNames[i];
  archon.genome.senses[name] = { threshold: 0.5, multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: 1 };
}

archon.genome.senses.inertia.decayRate = 0;

describe('Cobber', function() {
  describe('Smoke test', function() {
    it('#module exists', function() {
      var c = function() { A.Cobber = require('../Cobber.js'); };
      chai.expect(c).to.not.throw();
      chai.expect(A).to.have.property('Cobber');
    });
    
    it('#object exists', function() {
      chai.assert.typeOf(A.Cobber, "Function");
    });
  
    describe('#public functions exist', function() {
      var names = [
        'chooseAction', 'launch', 'senseArchon', 'senseFood', 'senseTemperature'
      ];
      
      for(var n in names) {
        var name = names[n];
      
        (function(name) {
          it('#' + name + '()', function() {
            var c = new A.Cobber(archon);
            chai.expect(c).to.have.property(name);
            chai.assert.typeOf(c[name], "Function");
          });
        })(name);
      }
    });
  });
  
  describe('Functionality', function() {
    describe('#chooseAction()', function() {
      it('#default action is launch', function() {
        var c = new A.Cobber(archon);
        chai.expect(c.chooseAction()).to.include({ action: 'launch', direction: 0 });
      });
      
      it('#inertia vs various sense dimensions', function() {
        var c = new A.Cobber(archon), i = null;
        
        var senseInfo = [
          // Some senses are non-spatial, so they have only one input, eg, hunger
          { dimension: 1, senseName: 'Hunger', action: 'searchForFood', deliveryHi: 1, deliveryLo: 0 },
          
          // Temp has only two: up and down
          { dimension: 2, senseName: 'Temperature', action: 'findGoodTemp', deliveryHi: 1, deliveryLo: 0 },
          
          // Spatial senses have 12 inputs
          { dimension: 12, senseName: 'Food', action: 'eat', deliveryHi: {calories: 1}, deliveryLo: {calories: 0} }
        ];

        var i = null, j = null, k = null;
        
        for(j = 0; j < senseInfo.length; j++) {
          // Do nothing until input ramps past the inertial threshold
          for(i = 0; i < 5; i++) {
            for(k = 0; k < senseInfo[j].dimension; k++) {
              c['sense' + senseInfo[j].senseName](k, senseInfo[j].deliveryHi);
            }

            chai.expect(c.chooseAction()).to.include({ action: 'launch', direction: 0 });
          }

          // Fill the inputs with max values to extend the decay period
          for(i = 0; i < 10; i++) {
            for(k = 0; k < senseInfo[j].dimension; k++) {
              c['sense' + senseInfo[j].senseName](k, senseInfo[j].deliveryHi);
            }

            chai.expect(c.chooseAction()).to.include({ action: senseInfo[j].action, direction: 0 });
          }
        
          // Move until just before the input drops below the inertial threshold
          for(i = 0; i < 4; i++) {
            for(k = 0; k < senseInfo[j].dimension; k++) {
              c['sense' + senseInfo[j].senseName](k, senseInfo[j].deliveryLo);
            }

            chai.expect(c.chooseAction()).to.include({ action: senseInfo[j].action, direction: 0 });
          }

          // Drop one more time and we should go back to sleep
          for(k = 0; k < senseInfo[j].dimension; k++) {
            c['sense' + senseInfo[j].senseName](k, senseInfo[j].deliveryLo);
          }

          chai.expect(c.chooseAction()).to.include({ action: 'launch', direction: 0 });

          // Get rid of all the other signals; we just want to test them one at a time
          var senseName = senseInfo[j].senseName;
          c.senses[senseName.toLowerCase()].coblet.reset();
          
        }
      });
    });
  });
});
