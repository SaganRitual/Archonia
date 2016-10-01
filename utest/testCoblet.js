var A = require('../Archonia.js');

A.prePhaserSetup();

A.integerInRange = function(lo, hi) {
  return Math.floor(Math.random() * (hi - lo) + lo);
};

var chai = require('chai');

var archon = {
  genome: {
    weightFood: 1, weightTemperature: 1, weightPredators: 1, weightToxins: 1, weightInertia: 1, weightFatigue: 1
  }
};

var calculateDecayedSignal = function(signals, howManyTicks) {
  var results = Array(signals.length).fill(0);
  
  for(i = 0; i < howManyTicks; i++) {
    for(j = 0; j < results.length; j++) {
      signals[j] -= 1;
      results[j] += signals[j];
      results[j] = Math.max(results[j], 0);
    }
  }
  
  var weight = 0;
  for(j = 0; j < results.length; j++) {
    weight += results[j];
  }
  
  return weight / (100 * howManyTicks * results.length);
}

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
    var names = [ 'gatherer', 'getAverages', 'getBestSignal', 'tick' ];
      
    for(var n in names) {
      var name = names[n];
      
      (function(name) {
        it('#' + name + '()', function() {
          var cc = new A.Coblet(1, function() {});
          chai.expect(cc).to.have.property(name);
          chai.assert.typeOf(cc[name], "Function");
        });
      })(name);
    }
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
      var target = { calledBack: false };
      var c = new A.Coblet(1, function() { target.calledBack = true; return []; });

      chai.expect(c).to.have.property('tick');
      chai.assert.typeOf(c.tick, 'Function');
      
      c.tick();
      chai.expect(target).to.include({ calledBack: true });
    });
    
    it('#decay/basic getSignal()', function() {
      var c = new A.Coblet(1, function() { return [100]; }, 0, 100);
      
      for(var i = 0; i < 10; i++) { c.tick.call(c); }
      
      // Note: calling this after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value
      var weight = (0.99 + 0.98 + 0.97 + 0.96 + 0.95 + 0.94 + 0.93 + 0.92 + 0.91 + 0.90) / 10;
      
      chai.expect(c.getBestSignal(1)).to.include({ direction: 0, weight: weight });
    });
    
    it('#getBestSignal with multiple inputs', function() {
      var c = new A.Coblet(5, function() { return [50, 27, 80, 70, 60]; }, 0, 100);
      
      var howManyTicks = 11;
      for(var i = 0; i < howManyTicks; i++) { c.tick(); }
      
      // Note: calling this after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value
      var weight = calculateDecayedSignal([80], howManyTicks);
      
      chai.expect(c.getBestSignal(1).weight.toFixed(2)).equal(weight.toFixed(2));
    });

    it('#getBestSignal with spread', function() {
      // Note: calling the signal function after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value

      var c = new A.Coblet(6, function() { return [60, 60, 10, 80, 1, 20]; }, 0, 100);

      var howManyTicks = 1;
      for(var i = 0; i < howManyTicks; i++) { c.tick(); }
      
      var weight = null;

      weight = calculateDecayedSignal([80], howManyTicks);
      chai.expect(c.getBestSignal(1).direction).equal(3);
      chai.expect(c.getBestSignal(1).weight.toFixed(2)).equal(weight.toFixed(2));

      weight = calculateDecayedSignal([60, 60], howManyTicks);
      chai.expect(c.getBestSignal(2).direction).within(0, 1);
      chai.expect(c.getBestSignal(2).weight.toFixed(2)).equal(weight.toFixed(2));

      weight = calculateDecayedSignal([60, 10, 80], howManyTicks);
      chai.expect(c.getBestSignal(3).direction).equal(2);
      chai.expect(c.getBestSignal(3).weight.toFixed(2)).equal(weight.toFixed(2));

      weight = calculateDecayedSignal([60, 60, 10, 80], howManyTicks);
      chai.expect(c.getBestSignal(4).direction).within(1, 2);
      chai.expect(c.getBestSignal(4).weight.toFixed(2)).equal(weight.toFixed(2));

      weight = calculateDecayedSignal([20, 60, 60, 10, 80], howManyTicks);
      chai.expect(c.getBestSignal(5).direction).equal(1);
      chai.expect(c.getBestSignal(5).weight.toFixed(2)).equal(weight.toFixed(2));
    });
  });
});
