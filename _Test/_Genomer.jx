var chai = require('chai');
var assert = require('assert');

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

var g = require('../Genomer.js');

Archonia.Cosmos.Genomer = g.Genomer 
Archonia.Form.Gene = g.Gene
Archonia.Form.ScalarGene = g.ScalarGene
Archonia.Form.ColorGene = g.ColorGene
var tinycolor = require('../TinyColor/tinycolor.js');

Archonia.Axioms = require('../Axioms.js');
Archonia.Essence = require('../Essence.js');

var archon1 = {
};

var archon2 = {
};

describe('Genomer/Genes', function() {
  describe('Genomer', function() {
    Archonia.Cosmos.Genomer.genomifyMe(archon1);
    Archonia.Cosmos.Genomer.inherit(archon1);
    it('Should store a genome', function() {
      chai.expect(archon1).to.have.property('genome');
      //chai.expect(archon1.genome).to.have.property('optimalTemp');
      //chai.expect(archon1.genome).to.have.property('hungerToleranceFactor');
    });
    
    it('Should do that cool thing with getters', function() {
      chai.expect(archon1.genome.optimalTempHi).equal(200);
    });
    
    it('Should throw exception for non-existent gene access', function() {
      var thisShouldWork = function() { var g = archon1.genome.optimalTempHi; };
      var thisShouldFail = function() { var g = archon1.genome.optimalTempHiThere; };

      chai.expect(thisShouldWork).to.not.throw();
      chai.expect(thisShouldFail).to.throw(Error, "No such property");
    });
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
    var cg = new Archonia.Form.ColorGene(tinycolor('hsl(180, 100%, 50%)'), 400),
        dg = new Archonia.Form.ColorGene(tinycolor('hsl(180, 100%, 50%)'), 400);
    
    it('Gene should construct properly', function() {
      chai.expect(cg).to.include({ changeProbability: 10, changeRange: 10 });
      chai.expect(cg).to.have.property('color');
      
      var t = tinycolor('hsl(180, 100%, 50%)');
      
      t._tc_id = 0; cg.color._tc_id = 0;  // Because tinycolor assigns unique IDs
      
      chai.expect(cg.color).to.deep.equal(t);
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
      chai.expect(cg.getOptimalTempHi()).equal(200);
      chai.expect(cg.getOptimalTempLo()).equal(-200);
    }),

    it('Should inherit with add', function() {
      cg.inherit(dg);
      
      var possibleChangeRange = dg.changeRange + 30;  // Because of the twist in mutateScalar()
      
      chai.expect(cg.changeProbability).within(dg.changeProbability * (1 - possibleChangeRange / 100), dg.changeProbability * (1 + possibleChangeRange / 100));
      chai.expect(cg.changeRange).within(dg.changeRange * (1 - possibleChangeRange / 100), dg.changeRange * (1 + possibleChangeRange / 100));

      var t = tinycolor(cg.color).toHsl();
      chai.expect(t.h).within(0, 360); chai.expect(t.s).within(0, 100); chai.expect(t.l).within(0, 100);
    });
  });
});
