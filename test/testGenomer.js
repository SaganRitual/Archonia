var chai = require('chai');
var assert = require('assert');

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

var v = require('../Genomer.js');
Archonia.Cosmos = v.Cosmos;
Archonia.Form = v.Form;

Archonia.Axioms = require('../Axioms.js');

var archon1 = {
};

var archon2 = {
};

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
    var cg = new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 50%, 50%)')),
        dg = new Archonia.Form.ColorGene(Archonia.Form.tinycolor('hsl(180, 50%, 50%)'));
    
    it('Gene should construct properly', function() {
      chai.expect(cg).to.include({ changeProbability: 10, changeRange: 10 });
      chai.expect(cg).to.have.property('color');
      chai.expect(cg.color.toRgb()).to.include({ r: 64, g: 191, b: 191 });
    });
    
    it('mutateYN() Should return true or false', function() {
      chai.expect(typeof cg.mutateYN()).equal('boolean');
    })
    
    it('mutateMutatability() should not botch control values', function() {
      cg.mutateMutatability(cg);
      chai.expect(isNaN(cg.changeProbability)).false;
      chai.expect(isNaN(cg.changeRange)).false;
    });

    it('Should inherit with add', function() {
      cg.inherit(dg);
      
      var possibleChangeRange = dg.changeRange + 30;  // Because of the twist in mutateScalar()
      
      chai.expect(cg.changeProbability).within(dg.changeProbability * (1 - possibleChangeRange / 100), dg.changeProbability * (1 + possibleChangeRange / 100));
      chai.expect(cg.changeRange).within(dg.changeRange * (1 - possibleChangeRange / 100), dg.changeRange * (1 + possibleChangeRange / 100));

      var t = Archonia.Form.tinycolor(cg.color).toHsl();
      chai.expect(t.h).within(0, 360); chai.expect(t.s).within(0, 100); chai.expect(t.l).within(0, 100);
    });
  });
});
