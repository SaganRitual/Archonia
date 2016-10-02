var A = require('../Archonia.js');

A.prePhaserSetup();

A.integerInRange = function(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
};

var chai = require('chai');

var calculateDecayedSignal = function(signals, howManyTicks, decayRate) {
  if(decayRate === undefined) { decayRate = 1; }
  var results = Array(signals.length).fill(0);
  
  for(i = 0; i < howManyTicks; i++) {
    for(j = 0; j < results.length; j++) {
      signals[j] -= decayRate * 100;
      signals[j] = A.clamp(signals[j], 0, 100);
      results[j] += signals[j];
      results[j] = Math.max(results[j], 0);
    }
  }
  
  var weight = 0;
  for(j = 0; j < results.length; j++) {
    weight += results[j];
  }
  
  return weight / (100 * howManyTicks * results.length);
};

var FakeCobber = function(depth, gatherer, lo, hi, decayRate) { 
  this.calledBack = false;
  this.coblet = new A.Coblet(depth, gatherer, this, lo, hi, decayRate);
};

FakeCobber.prototype = { gatherer: null, tick: function() { this.coblet.tick(); } };

describe('Coblet', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { A.Coblet = require('../Coblet.js'); };
      chai.expect(c).to.not.throw();
      chai.expect(A).to.have.property('Coblet');
    });

    it('#Object exists', function() {
      chai.assert.typeOf(A.Coblet, "Function");
    });
  });
  
  describe('#public functions exist', function() {
    var names = [ 'getBestSignal', 'store' ];
      
    for(var n in names) {
      var name = names[n];
      
      (function(name) {
        it('#' + name + '()', function() {
          var cc = new A.Coblet(1, function() {});
          chai.expect(cc).to.have.property(name);
          chai.assert.isFunction(cc[name]);
        });
      })(name);
    }
  });
  
  describe('Cost/benefit functionality', function() {
    it('#getBestSignal(), single input point, single tick', function() {
      var measurementDepth = 10, howManyMeasurementPoints = 1, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
      var c = new A.Coblet(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
      c.store(0, 100);
      var s = c.getBestSignal();
      
      chai.expect(s).to.include({ direction: 0, weight: 0.099 });
    });
    
    it('#getBestSignal(), multiple inputs, single tick', function() {
      var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
      var c = new A.Coblet(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
      c.store(0, 100); c.store(1, 50); c.store(2, 75); c.store(3, 90); c.store(4, 17);
      var s = c.getBestSignal();
      
      chai.expect(s.direction).within(0, 1);
      chai.expect(s.weight).equal(0.099);
    });
    
    it('#getBestSignal(), multiple inputs, multiple ticks', function() {
      var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
      var c = new A.Coblet(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
      c.store(0, 100); c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4,  0);
      c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4,  0);
      c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4, 17);
      c.store(0, 0);   c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4,  0);
      c.store(0, 0);   c.store(1,  0); c.store(2,  0); c.store(3, 90); c.store(4,  0);
      
      var s = c.getBestSignal();
      
      chai.expect(s.direction).equal(3);
      chai.expect(s.weight.toFixed(4)).equal(((89 + 88 + 87 + 86 + 85) / (10 * 100)).toFixed(4));
    });

    it('#getBestSignal with spread', function() {
      var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
      var c = new A.Coblet(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
      c.store(0, 100); c.store(1,  0); c.store(2,  5); c.store(3, 90); c.store(4,  0);
      c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4, 50);
      c.store(0, 100); c.store(1, 50); c.store(2,  0); c.store(3,  0); c.store(4, 17);
      c.store(0, 0);   c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4, 80);
      c.store(0, 0);   c.store(1,  0); c.store(2,  0); c.store(3, 90); c.store(4,  0);
      
      var s = null;
      
      s = c.getBestSignal(1); chai.expect(s.direction).equal(3);
      s = c.getBestSignal(2); chai.expect(s.direction).within(3, 4);
      s = c.getBestSignal(3); chai.expect(s.direction).equal(4);
    });
  });
});
