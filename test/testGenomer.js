var chai = require('chai');
var assert = require('assert');

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

var g = require('../Genomer.js');

Archonia.Cosmos.Genomer = g.Genomer 
Archonia.Form.Gene = g.Gene
Archonia.Form.ScalarGene = g.ScalarGene
Archonia.Form.ColorGene = g.ColorGene
Archonia.Form.SenseGene = g.SenseGene
Archonia.Form.SenseGeneFixed = g.SenseGeneFixed
Archonia.Form.SenseGeneVariable = g.SenseGeneVariable
Archonia.Form.tinycolor = require('../widgets/tinycolor.js');

Archonia.Axioms = require('../Axioms.js');

var archon1 = {
};

var archon2 = {
};

var testMakeGene = function(makeGene) {
  chai.expect(makeGene).to.not.throw();
  
  var multiplier = 1, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;

  sg = makeGene();
  chai.expect(sg).to.include({
    multiplier: multiplier, decayRate: decayRate, valuesRangeLo: valuesRangeLo, valuesRangeHi: valuesRangeHi
  });
};

var testInheritanceResult = function(makeGene, doResultStuff) {
  var sg = makeGene(), tg = makeGene();

  sg.inherit(tg);
  
  var possibleChangeRange = tg.changeRange + 30;  // Because of the twist in mutateScalar()
  
  chai.expect(sg.changeProbability).within(tg.changeProbability * (1 - possibleChangeRange / 100), tg.changeProbability * (1 + possibleChangeRange / 100));
  chai.expect(sg.changeRange).within(tg.changeRange * (1 - possibleChangeRange / 100), tg.changeRange * (1 + possibleChangeRange / 100));

  doResultStuff(sg);
}

describe('Genomer', function() {
  describe('Smoke test', function() {
    Archonia.Cosmos.Genomer.genomifyMe(archon1);
    it('Should store a genome', function() { chai.expect(archon1).to.have.property('genome'); });
  });

  describe('ScalarGene', function() {
    var sg = new Archonia.Form.ScalarGene(42), tg = new Archonia.Form.ScalarGene(43);
    
    it('Gene should construct properly', function() {
      chai.expect(sg).to.include({value: 42, changeProbability: 10, changeRange: 10});
    });
    
    it('mutateYN() Should return true or false', function() {
      chai.expect(typeof sg.mutateYN()).equal('boolean');
    })
    
    it('mutateScalar() should return a number', function() {
      chai.expect(typeof sg.mutateScalar(42)).equal('number');
    });
    
    it('mutateMutatability() should not botch control values', function() {
      sg.mutateMutatability(tg);
      chai.expect(isNaN(sg.changeProbability)).false;
      chai.expect(isNaN(sg.changeRange)).false;
    });
    
    it('Should inherit with multiply', function() {
      var probability = tg.changeProbability, range = tg.changeRange;
      
      for(var i = 0; i < 100; i++) {
        sg.inherit(tg);
        
        var possibleChangeRange = tg.changeRange + 30;  // Because of the twist in mutateScalar()
        
        chai.expect(sg.changeProbability).within(tg.changeProbability * (1 - possibleChangeRange / 100), tg.changeProbability * (1 + possibleChangeRange / 100));
        chai.expect(sg.changeRange).within(tg.changeRange * (1 - possibleChangeRange / 100), tg.changeRange * (1 + possibleChangeRange / 100));

        chai.expect(sg.value).within(tg.value * (1 - possibleChangeRange / 100), tg.value * (1 + possibleChangeRange / 100));
      }
    });
  });
  
  describe('ColorGene', function() {
    var cg = new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 50%, 50%)'), 400),
        dg = new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 50%, 50%)'), 400);
    
    it('Gene should construct properly', function() {
      chai.expect(cg).to.include({ changeProbability: 10, changeRange: 10 });
      chai.expect(cg).to.have.property('color');
      chai.expect(cg.color.toRgb()).to.include({ r: 64, g: 191, b: 191 });
      chai.expect(cg).to.have.property('tempRangeGene');
      chai.expect(cg.tempRangeGene).to.include({value: 400, changeProbability: 10, changeRange: 10});
    });
    
    it('mutateYN() Should return true or false', function() {
      chai.expect(typeof cg.mutateYN()).equal('boolean');
    })
    
    it('mutateMutatability() should not botch control values', function() {
      cg.mutateMutatability(cg);
      chai.expect(isNaN(cg.changeProbability)).false;
      chai.expect(isNaN(cg.changeRange)).false;
    });
    
    it('tempRange, optimalHi, optimalLo', function() {
      chai.expect(cg.getOptimalTemp()).equal(0);
      chai.expect(cg.getOptimalHiTemp()).equal(200);
      chai.expect(cg.getOptimalLoTemp()).equal(-200);
    }),

    it('Should inherit with add', function() {
      cg.inherit(dg);
      
      var possibleChangeRange = dg.changeRange + 30;  // Because of the twist in mutateScalar()
      
      chai.expect(cg.changeProbability).within(dg.changeProbability * (1 - possibleChangeRange / 100), dg.changeProbability * (1 + possibleChangeRange / 100));
      chai.expect(cg.changeRange).within(dg.changeRange * (1 - possibleChangeRange / 100), dg.changeRange * (1 + possibleChangeRange / 100));

      var t = Archonia.Form.tinycolor(cg.color).toHsl();
      chai.expect(t.h).within(0, 360); chai.expect(t.s).within(0, 100); chai.expect(t.l).within(0, 100);
      
      possibleChangeRange = dg.tempRangeGene.changeRange + 30;  // Because of the twist in mutateScalar()
      
      chai.expect(cg.tempRangeGene.changeProbability).within(dg.tempRangeGene.changeProbability * (1 - possibleChangeRange / 100), dg.tempRangeGene.changeProbability * (1 + possibleChangeRange / 100));
      chai.expect(cg.tempRangeGene.changeRange).within(dg.tempRangeGene.changeRange * (1 - possibleChangeRange / 100), dg.tempRangeGene.changeRange * (1 + possibleChangeRange / 100));
    });
  });

  describe('senseManna genes', function() {
    it('Base class newGene() is pure virtual', function() {
      var ng = function() { var n = new Archonia.Form.SenseGene(); n.newGene(); };
      chai.expect(ng).to.throw(Error, 'SenseGene.newGene() is pure virtual');
    });
    
    it('SenseGeneFixed', function() {
      var makeGene = function() {
        var multiplier = 1, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        return new Archonia.Form.SenseGeneFixed(multiplier, decayRate, valuesRangeLo, valuesRangeHi);
      };
      
      var doResultStuff = function(sg) {
        var multiplier = 1, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        chai.expect(sg.valuesRangeLo).equal(valuesRangeLo); chai.expect(sg.valuesRangeHi).equal(valuesRangeHi);
      };

      testMakeGene(makeGene);
      testInheritanceResult(makeGene, doResultStuff);
    });
  
    it('SenseGeneVariable', function() {
      var makeGene = function() {
        var multiplier = 1, decayRate = 0.01, valuesRangeLo = 0, valuesRangeHi = 1;
        return new Archonia.Form.SenseGeneVariable(multiplier, decayRate, valuesRangeLo, valuesRangeHi);
      };
      
      var doResultStuff = function(sg) {
        chai.expect(typeof sg.multiplier).equal('number'); chai.expect(typeof sg.multiplier).equal('number');
      }

      testMakeGene(makeGene);
      testInheritanceResult(makeGene, doResultStuff);
    });
  });
});
