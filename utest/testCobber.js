var A = require('../Archonia.js');

A.prePhaserSetup();

A.integerInRange = function(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
};

var chai = require('chai');

var archon = {
  genome: {
    cobs: {
      temperature: {
        threshold: 0.5, multiplier: 5, decayRate: 0.10, valuesRangeLo: A.temperatureRange.lo, valuesRangeHi: A.temperatureRange.hi
      }
    }
  }
};

var cobNames = [ 'fatigue', 'food', 'inertia', 'predators', 'prey', 'hunger', 'temperature', 'toxins' ];

for(var i = 0; i < cobNames.length; i++) {
  var name = cobNames[i];
  archon.genome.cobs[name] = { threshold: 0.5, multiplier: 1, decayRate: 0.10 };
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
        'chooseAction', 'launch', 'senseArchon', 'senseFood', 'senseTemp', 'tick'
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
        chai.expect(c.chooseAction()).equal('encapsulate');
      });
      
      it('#state change when inertial threshold reached');
    });
  });
});
