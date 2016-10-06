var Archotype = require('../Archonia.js');

var A = new Archotype.Archonia(); A.go({});

Archotype.Phenotype = require('../Phenotype.js');

var chai = require('chai');

A.sun = {
  currentTemp: 451,
  
  getTemperature: function(where) {
    return this.currentTemp;
  }
}

var archon = {
  alive: true,
  spawned: false,
  
  genome: {
    embryoThreshold: 200, reproductionThreshold: 500,
    birthMass: { adultCalories: 100, larvalCalories: 100 },
    offspringMass: { adultCalories: 125, larvalCalories: 75 },
    optimalTemp: 200, optimalTempRangeWidth: 400
  },
  
  button: {
    tint: 0
  },
  
  phaseron: {
    width: 0,
    height: 0,
    radius: 0,
    
    body: {
      setCircle: function(r) { archon.phaseron.radius = r; },
      setSize: function(w, h) { archon.phaseron.width = w; archon.phaseron.height = h; }
    },
    
    scale: {
      x: 0, y: 0,
      setTo: function(x, y) {
        archon.phaseron.scale.x = x; archon.phaseron.scale.y = y;
        archon.phaseron.width = x; archon.phaseron.height = y;
        archon.phaseron.radius = x / 2;
      }
    }
  },
  
  breed: function() { archon.spawned = true; },
  die: function() { archon.alive = false; }
};

var food = { calories: 100 };

var eat = function(phenotype, howManyCalories) {
  for(var i = 0; i < howManyCalories; i += 100) {
    phenotype.eat(food);
  }
}

describe('Phenotype', function() {
  describe('Constructor', function() {
    it('Should throw an exception if no archon is passed', function() {
      var makeBadPhenotype = function() { var p = new Archotype.Phenotype(); };
      
      chai.expect(makeBadPhenotype).to.throw(TypeError, "Phenotype needs an archon");
    });
  });
    
  describe('Individual functions', function() {
    describe('setColors()', function() {
      it('Should set the button based on temp tolerance', function() {
        var p = new Archotype.Phenotype(A, archon); p.launch();
        
        archon.genome.optimalTemp = 200; archon.genome.optimalTempRangeWidth = 400;
        
        A.sun.currentTemp = 200;
        p.setColors();
        chai.expect(archon.button.tint).equal(0x00FF00);
        
        A.sun.currentTemp = -1;
        p.setColors();
        chai.expect(archon.button.tint).equal(0x0000FF);
        
        A.sun.currentTemp = 401;
        p.setColors();
        chai.expect(archon.button.tint).equal(0xFF0000);
      });
    });
    
    describe('getMotionCost()', function() {
      it('Should be linearly proportional to mass', function() {
        var p = new Archotype.Phenotype(A, archon);

        p.embryoCalorieBudget = 1000; p.larvalCalorieBudget = 0; p.adultCalorieBudget = 0;
        chai.expect(p.getMotionCost().toFixed(2)).equal((1).toFixed(2));
        
        p.larvalCalorieBudget = 1000;
        chai.expect(p.getMotionCost().toFixed(2)).equal((2).toFixed(2));

        p.adultCalorieBudget = 100;
        chai.expect(p.getMotionCost().toFixed(2)).equal((3).toFixed(2));
      });
    });
    
    describe('getTemperatureCost()', function() {
      var p = new Archotype.Phenotype(A, archon);
      p.adultCalorieBudget = 100; p.embryoCalorieBudget = 0; p.larvalCalorieBudget = 0;

      it('Should get the right cost, based on archon size, zero temp delta', function() {
        A.sun.currentTemp = archon.genome.optimalTemp;
        
        chai.expect(p.getTempCost().toFixed(4)).equal((Math.log(2) * Math.log(2)).toFixed(4));
        
        p.adultCalorieBudget = 200;
        chai.expect(p.getTempCost().toFixed(4)).equal((Math.log(2) * Math.log(3)).toFixed(4));
      });
      
      it('Should get the right cost with non-zero temp delta', function() {
        A.sun.currentTemp = archon.genome.optimalTemp - 200;

        var r = Math.abs(A.sun.currentTemp - archon.genome.optimalTemp);
        var s = Math.log((r || 1) + 1) * Math.log(p.getMass() + 1);
        console.log(s);

        var c = p.getTempCost().toFixed(4);
        chai.expect(c).equal(s.toFixed(4));
        
        A.sun.currentTemp = archon.genome.optimalTemp + 500;
        
        r = Math.abs(A.sun.currentTemp - archon.genome.optimalTemp);
        s = Math.log((r || 1) + 1) * Math.log(p.getMass() + 1);
        console.log(s);

        c = p.getTempCost().toFixed(4);
        chai.expect(c).equal(s.toFixed(4));
      });
    });
    
    describe('debit()', function() {
      var p = new Archotype.Phenotype(A, archon);
      
      it('Should draw from larval budget first', function() {
        p.larvalCalorieBudget = 1; p.embryoCalorieBudget = 2; p.adultCalorieBudget = 3;
        p.debit(1);
        
        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget).equal(2);
        chai.expect(p.adultCalorieBudget).equal(3);
      });
      
      it('Should draw from embryo budget at increased cost', function() {
        p.larvalCalorieBudget = 3; p.embryoCalorieBudget = 10; p.adultCalorieBudget = 3;
        p.debit(8);
        
        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget.toFixed(2)).equal((3.33).toFixed(2));
        chai.expect(p.adultCalorieBudget).equal(3);
      });
      
      it('Should draw from adult budget last', function() {
        p.larvalCalorieBudget = 3; p.embryoCalorieBudget = 10; p.adultCalorieBudget = 3;
        p.debit(11);
        
        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget.toFixed(2)).equal((2.33).toFixed(2));
      });

      it('Should die when all reserves are depleted', function() {
        p.larvalCalorieBudget = 3; p.embryoCalorieBudget = 8; p.adultCalorieBudget = 3;
        
        archon.spawned = false;

        p.debit(3);
        chai.expect(archon.alive).true;

        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget).equal(8);
        chai.expect(p.adultCalorieBudget).equal(3);

        p.debit(6);
        chai.expect(archon.alive).true;

        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(3);

        p.debit(3);
        chai.expect(archon.alive).false;
        
        chai.expect(p.larvalCalorieBudget).equal(0);
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(0);
      });
    });
    
    describe('getMass()', function() {
      var p = new Archotype.Phenotype(A, archon);
      
      it('Should be correct when only adult budget > 0', function() {
        p.larvalCalorieBudget = 0;
        p.embryoCalorieBudget = 0;
        p.adultCalorieBudget = 100;
        chai.expect(p.getMass()).equal(1);
      });
      
      it('Should be correct when only larval budget > 0', function() {
        p.larvalCalorieBudget = 100;
        p.embryoCalorieBudget = 0;
        p.adultCalorieBudget = 0;
        chai.expect(p.getMass()).equal(0.1);
      });
      
      it('Should be correct when only embryo budget > 0', function() {
        p.larvalCalorieBudget = 0;
        p.embryoCalorieBudget = 100;
        p.adultCalorieBudget = 0;
        chai.expect(p.getMass()).equal(0.1);
      });
      
      it('Should apply differing calorie densities', function() {
        p.larvalCalorieBudget = 100;
        p.embryoCalorieBudget = 100;
        p.adultCalorieBudget = 100;
        chai.expect(p.getMass().toFixed(2)).equal((1.20).toFixed(2));
      });
    });
    
    describe('setSize()', function() {
      var p = new Archotype.Phenotype(A, archon);
      
      it('Should respond to differing mass values', function() {
        p.larvalCalorieBudget = 0; p.embryoCalorieBudget = 0; p.adultCalorieBudget = 0;
        chai.expect(p.getMass()).equal(0);
        
        p.adultCalorieBudget = 100; p.setSize();
        chai.expect(archon.phaseron.scale.x).equal(1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.width).equal(1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.height).equal(1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.radius).equal(0.5 / A.archoniaGooDiameter);
        
        p.larvalCalorieBudget = 100;  p.setSize();
        chai.expect(archon.phaseron.scale.x).equal(1.1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.width).equal(1.1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.height).equal(1.1 / A.archoniaGooDiameter);
        chai.expect(archon.phaseron.radius.toFixed(2)).equal((1.1 / 2 / A.archoniaGooDiameter).toFixed(2));
      });
    });

    describe('launch()', function() {
      it('Should respond to differing birth weight values', function() {
        archon.genome.birthMass.adultCalories = 75;
        archon.genome.birthMass.larvalCalories = 200;

        var p = new Archotype.Phenotype(A, archon); p.launch();
        
        chai.expect(p.adultCalorieBudget).equal(75);
        chai.expect(p.larvalCalorieBudget).equal(200);
        chai.expect(archon.phaseron.width).equal(0.95 / A.archoniaGooDiameter);

        archon.genome.birthMass.adultCalories = 800;
        archon.genome.birthMass.larvalCalories = 100;

        var p = new Archotype.Phenotype(A, archon); p.launch();
        
        chai.expect(p.adultCalorieBudget).equal(800);
        chai.expect(p.larvalCalorieBudget).equal(100);
        chai.expect(archon.phaseron.width.toFixed(2)).equal((8.1 / A.archoniaGooDiameter).toFixed(2));
      });
    });

    describe('eat()', function() {
      it('Should apply calories to adult first, then embryo per genome, never larval', function() {
        archon.genome.embryoThreshold = 400;
        archon.genome.reproductionThreshold = 400;
        archon.genome.birthMass.adultCalories = 100;
        archon.genome.birthMass.larvalCalories = 100;
        archon.genome.offspringMass.adultCalories = 100;
        archon.genome.offspringMass.larvalCalories = 500;
        archon.spawned = false;

        var p = new Archotype.Phenotype(A, archon); p.launch();
      
        eat(p, 900);
        chai.expect(archon.spawned).true;
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(350);
        chai.expect(p.larvalCalorieBudget).equal(0);
        
        archon.genome.birthMass.adultCalories = 75;
        archon.genome.birthMass.larvalCalories = 300;
        archon.spawned = false;

        p.launch();
      
        eat(p, 800);
        chai.expect(archon.spawned).true;
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(400);
        chai.expect(p.larvalCalorieBudget).equal(25);
      });
    });
    
    describe('breed()', function() {
      it('Should reproduce and incur varying genome-based costs', function() {
        archon.genome.embryoThreshold = 400;
        archon.genome.reproductionThreshold = 400;
        archon.genome.birthMass.adultCalories = 100;
        archon.genome.birthMass.larvalCalories = 100;
        archon.genome.offspringMass.adultCalories = 100;
        archon.genome.offspringMass.larvalCalories = 500;
        archon.spawned = false;

        var p = new Archotype.Phenotype(A, archon); p.launch();
      
        eat(p, 900);
        chai.expect(archon.spawned).true;
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(350);
        chai.expect(p.larvalCalorieBudget).equal(0);
        
        archon.genome.birthMass.adultCalories = 75;
        archon.genome.birthMass.larvalCalories = 300;
        archon.spawned = false;

        p.launch();
      
        eat(p, 800);
        chai.expect(archon.spawned).true;
        chai.expect(p.embryoCalorieBudget).equal(0);
        chai.expect(p.adultCalorieBudget).equal(400);
        chai.expect(p.larvalCalorieBudget).equal(25);
      });
    });
  });
  
  describe('Overall functionality', function() {
    it('Should interact properly with genome when eating', function() {
      archon.genome.embryoThreshold = 200;
      archon.genome.reproductionThreshold = 500;
      archon.genome.birthMass.adultCalories = 100;
      archon.genome.birthMass.larvalCalories = 100;
      archon.spawned = false;

      var p = new Archotype.Phenotype(A, archon); p.launch();
      
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
      archon.spawned = false;

      var p = new Archotype.Phenotype(A, archon); p.launch();
    
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
      archon.spawned = false;

      var p = new Archotype.Phenotype(A, archon); p.launch();

      eat(p, 800);
      chai.expect(archon.spawned).false;
      
      eat(p, 100);
      chai.expect(archon.spawned).true;               // With our current settings, successful birth expected
      chai.expect(p.embryoCalorieBudget).equal(350);  // 200c baby + 25% entropy
      chai.expect(p.adultCalorieBudget).equal(400);   // No costs to adult fat; embryo budget covered all costs
      chai.expect(p.larvalCalorieBudget).equal(100);  // We haven't metabolized anything in this test suite yet
      
    });
    
    it('Should reproduce and incur excess costs', function() {
      archon.genome.embryoThreshold = 400;
      archon.genome.reproductionThreshold = 500;
      archon.genome.birthMass.adultCalories = 100;
      archon.genome.birthMass.larvalCalories = 100;
      archon.genome.offspringMass.adultCalories = 100;
      archon.genome.offspringMass.larvalCalories = 500;
      archon.spawned = false;

      var p = new Archotype.Phenotype(A, archon); p.launch();
      
      eat(p, 900);
      chai.expect(archon.spawned).true;
      chai.expect(p.embryoCalorieBudget).equal(0);
      chai.expect(p.adultCalorieBudget).equal(350);
      chai.expect(p.larvalCalorieBudget).equal(0);
    });
    
    it('Should deplete embryo at increased cost when starving', function() {
      // Reserving this for metabolism testing
    });
  });
});
