var A = require('../Archonia.js');
A.SignalSmoother = require('../widgets/SignalSmoother.js');
A.Cbuffer = require('../widgets/Cbuffer.js');

var game = require('./phaser.js').game;

var testData = require('./testBrain-data.js');
var archon = testData.archon;

A.prePhaserSetup();

var data_driven = require('data-driven');
var chai = require('chai');

var pushSingleSet = function(Brain, singleInputSet, senseName) {
  var fn = 'sense' + senseName.substr(0, 1).toUpperCase() + senseName.substr(1);

  for(var where = 0; where < singleInputSet.length; where++) {
    var signalValue = singleInputSet[where];
    Brain[fn](where, signalValue);
  }
}

var pushInputs = function(Brain, singleInputSet) {

  for(var senseName in singleInputSet) {
    
    var senseData = singleInputSet[senseName];
    
    if(senseName === 'archon') {
      pushSingleSet(Brain, senseData.predator.inputs, 'predator');
      pushSingleSet(Brain, senseData.prey.inputs, 'prey');
    } else {
      pushSingleSet(Brain, senseData.inputs, senseName);
    }

  }
}

describe('Brain', function() {
  describe('Smoke test', function() {
    it('#module exists', function() {
      var c = function() { A.Brain = require('../Brain.js'); };
      chai.expect(c).to.not.throw();
      chai.expect(A).to.have.property('Brain');
    });
    
    it('#object exists', function() {
      chai.assert.typeOf(A.Brain, "Function");
    });
  
    describe('#public functions exist', function() {
      var names = [
        'chooseAction', 'launch', 'sensePredator', 'sensePrey', 'senseFood',
        'senseHunger', 'senseTemperature', 'senseToxins'
      ];
      
      for(var n in names) {
        var name = names[n];
      
        (function(name) {
          it('#' + name + '()', function() {
            testData.Brain = new A.Brain(archon);
            chai.expect(testData.Brain).to.have.property(name);
            chai.assert.isFunction(testData.Brain[name]);
          });
        })(name);
      }
    });
  });
  
  describe('Functionality', function() {
    describe('#chooseAction()', function() {
      it('#sensors should never be empty', function() {
        var c = new A.Brain(archon);
        var d = function() { c.chooseAction(); };
        
        chai.expect(d).to.throw(Error, "Sensors should never be empty");
      });

      describe('#long-run', function() {
        data_driven(testData.senseTests, function() {
          it('#choose action as inputs vary', function(senseTest) {
            var c = testData.Brain;  // Note: using this one over and over for a long run

            for(var i = 0; i < senseTest.loopCount; i++) {
              pushInputs(c, senseTest.senses);
              chai.expect(c.chooseAction()).to.deep.include(senseTest.expectedResult);
            }
          });
        });
      });
    });
  });
});
