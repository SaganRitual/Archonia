var Archotype = require('../Archonia.js');

Archotype.Range = require('../widgets/Range.js');

var A = new Archotype.Archonia();
A.go({});

var chai = require('chai');
  
describe('SignalSmoother', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { Archotype.SignalSmoother = require('../widgets/SignalSmoother.js'); }
      chai.expect(c).to.not.throw();
    });
  });

  describe('#public functions exist', function() {
    var names = [
      'getSignalStrength', 'isEmpty', 'reset', 'store'
    ];
    
    for(var n in names) {
      var name = names[n];

      (function(name) {
        it('#' + name + '()', function() {
          var r = new Archotype.SignalSmoother(A);
          chai.assert.isFunction(r[name]);
        });
      })(name);
    }
  });
  
  describe('#functionality', function() {
    describe('#reset(), isEmpty()', function() {
      it('#before store, after store, after reset', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
        
        chai.expect(r.isEmpty()).equal(true);
        
        r.store(0);
        chai.expect(r.isEmpty()).equal(false);
        
        r.reset();
        chai.expect(r.isEmpty()).equal(true);
      });
    });
    
    describe('#store(), getSignalStrength()', function() {
      it('#single tick', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
  
        var valueToStore = 0.1;
        r.store(valueToStore);
        chai.expect(r.getSignalStrength().toFixed(2)).equal(((valueToStore - decayRate) / depth).toFixed(2));
      });

      it('#constant input to max', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
  
        var valueToStore = 0.10;
        for(var i = 0; i < 10; i++) {
          r.store(valueToStore);
      
          var expected = 0.09;
          for(var j = 0; j < i; j++) {
            expected += 0.09 - (0.01 * (j + 1));
          }
      
          chai.expect(r.getSignalStrength().toFixed(4)).equal((expected / 10).toFixed(4));
          expected -= 0.005;
        }
      });
  
      it('#various decay rates', function() {
        for(var decayRate = 0.001; decayRate < 0.2; decayRate += 0.001) {
          var depth = 10, valuesRangeLo = 0, valuesRangeHi = 1;
          var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
  
          var valueToStore = 0.10;
          var expectedSignals = [];
    
          for(var j = 0, signal = valueToStore; j < depth; j++, signal += valueToStore) {
            var decay = Math.min(decayRate * (j + 1), valueToStore);
            signal -= decay;
            expectedSignals.push(signal / depth);
          }
    
          for(var i = 0; i < 10; i++) {
            r.store(valueToStore);
            chai.expect(r.getSignalStrength().toFixed(6)).equal(expectedSignals[i].toFixed(6));
          }
        }
      });

      it('#constant input to max, zero -> decay to minimum', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
  
        var i = null, j = null, expected = null, valueToStore = 0.10;
        for(i = 0; i < 10; i++) {
          r.store(valueToStore);
      
          expected = 0.09;
          for(j = 0; j < i; j++) {
            expected += 0.09 - (0.01 * (j + 1));
          }
      
          chai.expect(r.getSignalStrength().toFixed(4)).equal((expected / 10).toFixed(4));
          expected -= 0.005;
        }
    
        for(i = 0; i < 10; i++) {
          r.store(0);
      
          expected = 0.36;
          for(j = 0; j < i; j++) {
            expected -= 0.09 - (0.01 * (j + 1));
          }
    
          chai.expect(r.getSignalStrength().toFixed(4)).equal((expected / 10).toFixed(4));
          expected -= 0.005;
        }
      });
  
      it('#varying input, ramp / decay', function() {
        var valuesToStore = [ 42, 13.7, 19, 69, 7, 15, 4, 65 ];
        var expectedSignals = [ 36.5, 33.67, 31.37, 34.07, 30.57, 27.87, 24.07, 26.37 ];
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 100;
        var r = new Archotype.SignalSmoother(A, depth, decayRate, valuesRangeLo, valuesRangeHi);
    
        var i = null, j = null, expected = null;
    
        for(i = 0; i < 10; i++) { r.store(valuesToStore[0]); }

        for(i = 0; i < valuesToStore.length; i++) {
          r.store(valuesToStore[i]);
          chai.expect(r.getSignalStrength().toFixed(4)).equal((expectedSignals[i] / 100).toFixed(4));
        }
      });
    });
  });
});