var A = require('../Archonia.js');

A.prePhaserSetup();

var chai = require('chai');

var archon = {
  genome: {
    weightFood: 1, weightTemperature: 1, weightPredators: 1, weightToxins: 1, weightInertia: 1, weightFatigue: 1
  }
};

describe('Cobber', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { A.Cobber = require('../Cobber.js'); };
      chai.expect(c).to.not.throw();
      chai.expect(A).to.have.property('Cobber');
    });
    
    it('#Object exists', function() {
      chai.assert.typeOf(A.Cobber, "Function");
    });
    
    it('#Object initializes', function() {
      var c = new A.Cobber(archon);
      chai.expect(c).to.have.property('inputs');
      chai.expect(c.inputs).to.include({ food: null, temperature: null, predators: null, prey: null, hunger: null, toxins: null, inertia: null, fatigue: null });
    });
  });
});

describe('Coblet', function() {
  describe('Smoke test', function() {
    it('#Object exists', function() {
      chai.assert.typeOf(A.Coblet, "Function");
    });
    
    it('#Object initializes', function() {
      var howManyPoints = 12;
      var cc = new A.Coblet(howManyPoints, function() {});
      chai.expect(cc).to.have.property('rounders');
      chai.expect(cc.rounders instanceof Array).true;
      chai.expect(cc).to.have.property('valuesRange');
    });
  });
  
  describe('#functions exist', function() {
    it('#gatherer()', function() {
      var cc = new A.Coblet(1, function() {});
      chai.expect(cc).to.have.property('gatherer');
      chai.assert.typeOf(cc.gatherer, "Function");
    });
    
    it('#tick()', function() {
      var cc = new A.Coblet(1, function() {});
      chai.expect(cc).to.have.property('tick');
      chai.assert.typeOf(cc.tick, "Function");
    });
    
    it('#getAverages()', function() {
      var cc = new A.Coblet(1, function() {});
      chai.expect(cc).to.have.property('getAverages');
      chai.assert.typeOf(cc.getAverages, "Function");
    });
    
    it('#getBestSignal()', function() {
      var cc = new A.Coblet(1, function() {});
      chai.expect(cc).to.have.property('getBestSignal');
      chai.assert.typeOf(cc.getBestSignal, "Function");
    });
  });
  
  describe('Cost/benefit functionality', function() {
    it('#tick callback throw for bad return', function() {
      var d = new A.Coblet(1, function() { });
      var t = function() { d.tick.call(d); }
      chai.expect(t).to.throw(ReferenceError, "Coblet callback must return an array");
    });
    
    it('#tick/callback', function() {
      var target = { calledBack: false };
      var c = new A.Coblet(1, function() { target.calledBack = true; return []; });

      chai.expect(c).to.have.property('tick');
      chai.assert.typeOf(c.tick, 'Function');
      
      c.tick();
      chai.expect(target).to.include({ calledBack: true });
    });
    
    it('#decay', function() {
      var c = new A.Coblet(1, function() { return [100]; }, 0, 100);
      
      for(var i = 0; i < 10; i++) { c.tick.call(c); }
      
      // Note: calling this after the tick means that the coblet will
      // already have decayed. To make the system work like the utest,
      // I'll have to make sure all the coblets tick at the beginning
      // of the update, so anyone who calls getBestSignal() will get
      // the post-decay value
      var weight = (0.99 + 0.98 + 0.97 + 0.96 + 0.95 + 0.94 + 0.93 + 0.92 + 0.91 + 0.90) / 10;
      
      chai.expect(c.getBestSignal.call(c)).to.include({ direction: 0, weight: weight });
    });
  });
});
