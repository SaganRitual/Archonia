var A = require('../Archonia.js');

A.prePhaserSetup();

A.integerInRange = function(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
};

var chai = require('chai');

var archon = {
  genome: {
    optimalTemp: -200, optimalTempRange: 400,
    cobs: {}
  }
};

var cobNames = [ 'fatigue', 'food', 'inertia', 'predators', 'prey', 'hunger', 'temperature', 'toxins' ];

for(var i = 0; i < cobNames.length; i++) {
  var name = cobNames[i];
  archon.genome.cobs[name] = { threshold: 0.5, multiplier: 1, decayRate: 0.01 };
}

archon.genome.cobs.inertia.decayRate = 0;

var tempRangeRadius = archon.genome.optimalTempRange / 2;
archon.genome.cobs.temperature = { threshold: 0.5, multiplier: 1, decayRate: 0.01, valuesRangeLo: 0, valuesRangeHi: tempRangeRadius };

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
        'chooseAction', 'launch', 'senseArchon', 'senseFood', 'senseTemperature', 'tick'
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
  
  describe('Per function', function() {
  });
  
  describe('Functionality', function() {
    describe('#chooseAction()', function() {
      it('#default action is encapsulate', function() {
        var c = new A.Cobber(archon);
        chai.expect(c.chooseAction()).to.include({ action: 'encapsulate', direction: 0 });
      });
      
      it('#maxed-out temperature - state change, then revert', function() {
        var c = new A.Cobber(archon), i = null;

        for(i = 0; i < 5; i++) {
          // The high temp will cause an emergency, but it will take a few
          // ticks for the sense input to actually ramp up. Make it ramp
          // up here, simulating that it's taking some time to get away
          // from the bad temp zone, so we can watch it ramp down in the next loop
          c.senseTemperature(archon.genome.optimalTemp + tempRangeRadius, 0);

          c.tick();
          chai.expect(c.chooseAction()).to.include({ action: 'move', direction: 0 });
        }
        
        // At a decay rate of 0.01, it will take us 6 ticks for the temperature
        // signal to go below the inertia threshold
        for(i = 0; i < 4; i++) {
          c.senseTemperature(archon.genome.optimalTemp, 0);
          c.tick();
          chai.expect(c.chooseAction()).to.include({ action: 'move', direction: 0 });
        }
        
        c.tick();
        chai.expect(c.chooseAction()).to.include({ action: 'encapsulate', direction: 0 });
      });
    });
  });
});
