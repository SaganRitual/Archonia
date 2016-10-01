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
    var names = [ 'gatherer', 'getAverages', 'getBestSignal', 'reset', 'tick' ];
      
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

  describe('#public properties exist', function() {
    var names = [ 'isEmpty' ];
    
    for(var n in names) {
      var name = names[n];
    
      (function(name) {
        it('#' + name, function() {
          var c = new A.Coblet(1, function() {});
          chai.expect(c).to.have.property(name);
          chai.assert.isNotFunction(c[name]);
        });
      })(name);
    }
  });

  describe('#public properties behave', function() {
    it('#empty/not empty', function() {
      var c = new A.Coblet(1, function() { return []; });
      chai.assert(c.isEmpty, 'isEmpty should be true');
    
      c.tick();
      chai.assert(!c.isEmpty, 'isEmpty should be false');

      c.reset();
      chai.assert(c.isEmpty, 'isEmpty should be true');
    });
  });
  
  describe('Cost/benefit functionality', function() {
    it('#tick callback throw for non-array return', function() {
      var d = new A.Coblet(1, function() { });
      var t = function() { d.tick.call(d); }
      chai.expect(t).to.throw(ReferenceError, "Coblet callback must return an array");
    });

    it('#tick callback throw for bad array return', function() {
      var d = new A.Coblet(1, function() { return [ 0, 1 ]; });
      var t = function() { d.tick.call(d); }
      chai.expect(t).to.throw(ReferenceError, "Coblet callback returned bad array");
    });
    
    it('#tick/callback', function() {
      var f = new FakeCobber(1, function() { this.calledBack = true; return []; });
      chai.expect(f.coblet).to.have.property('tick');
      chai.assert.isFunction(f.coblet.tick);
      
      f.tick();
      chai.expect(f).to.include({ calledBack: true });
    });
    
    it('#decay/basic getSignal()', function() {
      for(decayRate = 1; decayRate < 5; decayRate++) {
        (function(decayRate) {
          var f = new FakeCobber(1, function() { return [100]; }, 0, 100, decayRate);
          
          var howManyTicks = 10;
          for(var i = 0; i < howManyTicks; i++) { f.tick(); }
      
          // Note: calling this after the tick means that the coblet will
          // already have decayed. To make the system work like the utest,
          // I'll have to make sure all the coblets tick at the beginning
          // of the update, so anyone who calls getBestSignal() will get
          // the post-decay value
          var weight = calculateDecayedSignal([100], howManyTicks, decayRate);
      
          chai.expect(f.coblet.getBestSignal(1)).to.include({ direction: 0 });
          chai.expect(f.coblet.getBestSignal(1).weight.toFixed(4)).equal(weight.toFixed(4));
        })(decayRate);
      }
    });
    
    it('#getBestSignal with multiple inputs', function() {
      var f = new FakeCobber(5, function() { return [50, 27, 80, 70, 60]; }, 0, 100, 1);
      
      var howManyTicks = 11;
      for(var i = 0; i < howManyTicks; i++) { f.tick(); }
      
      // Note: calling this after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value
      var weight = calculateDecayedSignal([80], howManyTicks);
      
      chai.expect(f.coblet.getBestSignal(1).weight.toFixed(2)).equal(weight.toFixed(2));
    });

    it('#getBestSignal with spread, varying decay rates', function() {
      // Note: calling the signal function after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value

      for(var decayRate = -0.01; decayRate < 0.05; decayRate++) {
        for(var howManyTicks = 1; howManyTicks < 10; howManyTicks++) {
          var f = new FakeCobber(6, function() { return [60, 60, 10, 80, 1, 20]; }, 0, 100, decayRate);

          for(var i = 0; i < howManyTicks; i++) { f.tick(); }
      
          var weight = null;

          weight = calculateDecayedSignal([80], howManyTicks, decayRate);
          chai.expect(f.coblet.getBestSignal(1).direction).equal(3);
          chai.expect(f.coblet.getBestSignal(1).weight.toFixed(4)).equal(weight.toFixed(4));

          weight = calculateDecayedSignal([60, 60], howManyTicks, decayRate);
          chai.expect(f.coblet.getBestSignal(2).direction).within(0, 1);
          chai.expect(f.coblet.getBestSignal(2).weight.toFixed(4)).equal(weight.toFixed(4));

          weight = calculateDecayedSignal([60, 10, 80], howManyTicks, decayRate);
          chai.expect(f.coblet.getBestSignal(3).direction).equal(2);
          chai.expect(f.coblet.getBestSignal(3).weight.toFixed(4)).equal(weight.toFixed(4));

          weight = calculateDecayedSignal([60, 60, 10, 80], howManyTicks, decayRate);
          chai.expect(f.coblet.getBestSignal(4).direction).within(1, 2);
          chai.expect(f.coblet.getBestSignal(4).weight.toFixed(4)).equal(weight.toFixed(4));

          weight = calculateDecayedSignal([20, 60, 60, 10, 80], howManyTicks, decayRate);
          chai.expect(f.coblet.getBestSignal(5).direction).equal(1);
          chai.expect(f.coblet.getBestSignal(5).weight.toFixed(4)).equal(weight.toFixed(4));
        }
      }
    });
    
    it('#getBestSignal, decay with changing input values', function() {
      // Send it an 80 at first, then zeros after, make sure the signal
      // decays as expected -- rapidly, that is
      var decayRate = 0.01;
      var values = [80];
      var f = new FakeCobber(1, function() { return values.slice(); }, 0, 100, decayRate);

      
      for(var i = 0; i < 10; i++) {
        var expectedValue = (0.79 - (i * 0.01)) / (i + 1);
        f.tick();
        chai.expect(f.coblet.getBestSignal(1).weight.toFixed(4)).equal(expectedValue.toFixed(4));
        
        values = [0];
      }
    });
  });
});
