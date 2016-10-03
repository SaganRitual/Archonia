var A = require('../Archonia.js');
A.Ramper = require('../Ramper.js');
A.Rounder = require('../Rounder.js');

var game = require('./phaser.js').game;

var testData = require('./testCobber-data.js');
var archon = testData.archon;

A.prePhaserSetup();

var data_driven = require('data-driven');
var chai = require('chai');

var pushSingleSet = function(cobber, singleInputSet, senseName) {
  var fn = 'sense' + senseName.substr(0, 1).toUpperCase() + senseName.substr(1);

  for(var where = 0; where < singleInputSet.length; where++) {
    var signalValue = singleInputSet[where];
    cobber[fn](where, signalValue);
  }
}

var pushInputs = function(cobber, singleInputSet) {

  for(var senseName in singleInputSet) {
    
    var senseData = singleInputSet[senseName];
    
    if(senseName === 'archon') {
      pushSingleSet(cobber, senseData.predator.inputs, 'predator');
      pushSingleSet(cobber, senseData.prey.inputs, 'prey');
    } else {
      pushSingleSet(cobber, senseData.inputs, senseName);
    }

  }
}

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
        'chooseAction', 'launch', 'sensePredator', 'sensePrey', 'senseFood',
        'senseHunger', 'senseTemperature', 'senseToxins'
      ];
      
      for(var n in names) {
        var name = names[n];
      
        (function(name) {
          it('#' + name + '()', function() {
            testData.Cobber = new A.Cobber(archon);
            chai.expect(testData.Cobber).to.have.property(name);
            chai.assert.isFunction(testData.Cobber[name]);
          });
        })(name);
      }
    });
  });
  
  describe('Functionality', function() {
    describe('#chooseAction()', function() {
      it('#sensors should never be empty', function() {
        var c = new A.Cobber(archon);
        var d = function() { c.chooseAction(); };
        
        chai.expect(d).to.throw(Error, "Sensors should never be empty");
      });

      describe('#long-run', function() {
        data_driven(testData.senseTests, function() {
          it('#choose action as inputs vary', function(senseTest) {
            var c = testData.Cobber;  // Note: using this one over and over for a long run

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
