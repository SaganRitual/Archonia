var SignalSmoother = require('../Minions/SignalSmoother.js');

var chai = require('chai');

describe('SignalSmoother', function() {
  describe('#public functions exist', function() {
    var names = [
      'getSignalStrength', 'isEmpty', 'reset', 'store'
    ];
    
    for(var n in names) {
      var name = names[n];

      (function(name) {
        it('#' + name + '()', function() {
          var r = new SignalSmoother();
          chai.assert.isFunction(r[name]);
        });
      })(name);
    }
  });
  
  describe('#functionality -- scale n/a', function() {
    describe('#reset(), isEmpty()', function() {
      it('#before store, after store, after reset', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
        
        chai.expect(r.isEmpty()).equal(true);
        
        r.store(0);
        chai.expect(r.isEmpty()).equal(false);
        
        r.reset();
        chai.expect(r.isEmpty()).equal(true);
      });
    });
  });
  
  describe('#functionality -- scale 0 to 1', function() {
    describe('#store(), getSignalStrength()', function() {
      it('#single tick', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
  
        var valueToStore = 0.1;
        r.store(valueToStore);
        chai.expect(r.getSignalStrength().toFixed(4)).equal(((valueToStore - decayRate) / depth).toFixed(4));
      });

      it('#constant input to max', function() {
        var depth = 10, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
  
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
          var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
  
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
        var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
  
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
        var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
    
        var i = null, j = null, expected = null;
    
        for(i = 0; i < 10; i++) { r.store(valuesToStore[0]); }

        for(i = 0; i < valuesToStore.length; i++) {
          r.store(valuesToStore[i]);
          chai.expect(r.getSignalStrength().toFixed(4)).equal((expectedSignals[i] / 100).toFixed(4));
        }
      });
    });
  });
  
  describe('#functionality -- scale -1 to 1', function() {
    it('#single tick, negative store', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -1, valuesRangeHi = 1;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);

      var valueToStore = -0.1;
      r.store(valueToStore);
      
      var expectedDecayResult = (valueToStore + decayRate) / depth;
      chai.expect(r.getSignalStrength().toFixed(6)).equal((expectedDecayResult).toFixed(6));
    });

    it('#single tick, positive store', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -1, valuesRangeHi = 1;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);

      var valueToStore = 0.1;
      r.store(valueToStore);
      
      // Note: for zero-centered, the SS cuts the decay in half
      var expectedDecayResult = (valueToStore - decayRate) / depth;
      chai.expect(r.getSignalStrength().toFixed(6)).equal((expectedDecayResult).toFixed(6));
    });

    it('#constant input to full, all negative', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -1, valuesRangeHi = 1;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);

      var valueToStore = -0.10;
      for(var i = 0; i < 10; i++) {
        r.store(valueToStore);
    
        var expected = -0.09;
        for(var j = 0; j < i; j++) {
          expected -= 0.09 - (0.01 * (j + 1));
        }

        chai.expect(r.getSignalStrength().toFixed(4)).equal((expected / 10).toFixed(4));
        expected += 0.005;
      }
    });
    
    it('#constant input to full, all positive', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -1, valuesRangeHi = 1;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);

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
    
    it('#constant input to full, mixed signs averaging zero', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -1, valuesRangeHi = 1;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
      var sign = 1;

      var baseValueToStore = 0.10;
      var expectedResults = [ 0.009, -0.001, 0.008, -0.002, 0.007, -0.003, 0.006, -0.004 ];
      for(var i = 0; i < expectedResults.length; i++) {
        r.store(baseValueToStore * sign);

        chai.expect(r.getSignalStrength().toFixed(4)).equal(expectedResults[i].toFixed(4));
        
        sign *= -1;
      }
    });
  });
  
  describe('#functionality -- scale -200 to 200', function() {
    it('#constant input to full, mixed signs averaging non-zero', function() {
      var depth = 10, decayRate = 0.01, valuesRangeLo = -200, valuesRangeHi = 200;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);

      var valuesToStore = [
        500, 400, 400, 400, 300, 200, 100, 0, -300, -400, -500, -400, -500, -100, 0
      ];
      
      var expectedResults = [
        0.099, 0.197, 0.294, 0.390, 0.485, 0.579, 0.622, 0.615, 0.509, 0.404, 0.211, 0.020, -0.169, -0.306, -0.392
      ];

      for(var i = 0; i < expectedResults.length; i++) {
        r.store(valuesToStore[i]);

        chai.expect(r.getSignalStrength().toFixed(6)).equal(expectedResults[i].toFixed(6));
      }
    });
    
    it("#decay shouldn't cause stored values to change sign", function() {
      var depth = 10, decayRate = 0.04, valuesRangeLo = -200, valuesRangeHi = 200, i = null;
      var r = new SignalSmoother(depth, decayRate, valuesRangeLo, valuesRangeHi);
      
      for(i = 0; i < depth; i++) { r.store(-200); } // Max out negative
      
      for(i = 0; i < depth; i++) { r.store(0); }  // Settle back to center
      
      chai.expect(r.getSignalStrength()).to.be.at.most(0);

      for(i = 0; i < depth; i++) { r.store(200); } // Max out negative

      for(i = 0; i < depth; i++) { r.store(0); }  // Settle back to center

      chai.expect(r.getSignalStrength()).to.be.at.least(0);
    });

    it('#various decay rates, all negative');
    it('#various decay rates, all positive');
    it('#various decay rates, mixed signs');
    it('#constant input to max, zero -> decay to minimum, all negative');
    it('#constant input to max, zero -> decay to minimum, all positive');
    it('#constant input to max, zero -> decay to minimum, mixed signs');
    it('#varying input, ramp / decay, all negative');
    it('#varying input, ramp / decay, all positive');
    it('#varying input, ramp / decay, mixed signs');
  });
});