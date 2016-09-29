var A = require('../Phenotype.js');
var chai = require('chai');

var archon = {
  spawned: false,
  
  genome: {
    embryoThreshold: 200, reproductionThreshold: 500,
    birthMass: { adultCalories: 100, larvalCalories: 100 },
    offspringMass: { adultCalories: 125, larvalCalories: 75 }
  },
  
  phaseron: {
    body: {
      setCircle: function(r) { archon.phaseron.radius = r; },
      setSize: function(w, h) { archon.phaseron.width = w; archon.phaseron.height = h; }
    },
    
    scale: {
      x: 0, y: 0,
      setTo: function(x, y) { archon.phaseron.scale.x = x; archon.phaseron.scale.y = y; }
    }
  },
  
  breed: function() {
    archon.spawned = true;
  }
};

var food = { calories: 100 };

var eat = function(phenotype, howManyCalories) {
  for(var i = 0; i < howManyCalories; i += 100) {
    phenotype.eat(food);
  }
}

describe('Phenotype', function() {
  describe('Constructor', function() {
    it('Should throw an exception if no genome is passed', function() {
      var makeBadPhenotype = function() { var p = new A.Phenotype(); };
      
      chai.expect(makeBadPhenotype).to.throw(TypeError, "Phenotype needs a genome");
    });
  });
    
  describe('Basics', function() {
    it('Should pass the smoke test', function() {
      var p = new A.Phenotype(archon); p.launch();
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.adultCalorieBudget).equal(100);
    });
    
    it('Should have the right initial mass and size', function() {
      var p = new A.Phenotype(archon); p.launch();
      chai.expect(p.getMass()).equal(1.1);
      chai.expect(archon.phaseron.scale.x.toFixed(3)).equal((1.1 / A.archoniaGooDiameter).toFixed(3));
    });
    
    it('Should interact properly with genome when eating', function() {
      archon.genome.embryoThreshold = 200;
      archon.genome.reproductionThreshold = 500;
      archon.genome.birthMass.adultCalories = 100;
      archon.genome.birthMass.larvalCalories = 100;

      var p = new A.Phenotype(archon); p.launch();
      
      eat(p, 100);
      chai.expect(p.adultCalorieBudget).equal(200); // Should increase the adult calorie budget
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(0);
      
      eat(p, 100);
      chai.expect(p.adultCalorieBudget).equal(200);// Should increase the adult calorie budget again; nothing in embryo yet
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(100);
      
      eat(p, 100);
      chai.expect(p.adultCalorieBudget).equal(200); // Now should have begun building the embryo
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(200);

      eat(p, 300);
      chai.expect(p.adultCalorieBudget).equal(200);   // Embryo should be complete now; birth imminent
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(500);
      chai.expect(archon.spawned).false;              // But not yet
    });
    
    
    it('Should interact properly with alternate genome settings', function() {
      archon.genome.embryoThreshold = 500;
      archon.genome.reproductionThreshold = 1000;
      archon.genome.birthMass.adultCalories = 100;
      archon.genome.birthMass.larvalCalories = 100;

      var p = new A.Phenotype(archon); p.launch();
    
      eat(p, 400);
      chai.expect(p.adultCalorieBudget).equal(500); // Max out adult calorie budget; no embryo yet
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(0);
      
      eat(p, 100);
      chai.expect(p.adultCalorieBudget).equal(500); // Now embryo is building
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(100);
      
      eat(p, 900);
      chai.expect(p.adultCalorieBudget).equal(500); // Embryo maxed out, no birth yet
      chai.expect(p.larvalCalorieBudget).equal(100);
      chai.expect(p.embryoCalorieBudget).equal(1000);
      chai.expect(archon.spawned).false;
    });
    
    it('Should reproduce and incur costs', function() {
      archon.genome.embryoThreshold = 400;
      archon.genome.reproductionThreshold = 500;
      archon.genome.birthMass.adultCalories = 100;
      archon.genome.birthMass.larvalCalories = 100;
      archon.genome.offspringMass.adultCalories = 125;
      archon.genome.offspringMass.larvalCalories = 75;

      var p = new A.Phenotype(archon); p.launch();

      eat(p, 800);
      chai.expect(archon.spawned).false;
      
      eat(p, 100);
      chai.expect(archon.spawned).true;               // With our current settings, successful birth expected
      chai.expect(p.embryoCalorieBudget).equal(350);  // 200c baby + 25% entropy
      chai.expect(p.adultCalorieBudget).equal(400);   // No costs to adult fat; embryo budget covered all costs
      chai.expect(p.larvalCalorieBudget).equal(100);  // We haven't metabolized anything in this test suite yet
      
    });
  });
});