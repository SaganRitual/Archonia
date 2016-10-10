var chai = require("chai");

process.env['BrainStates.Cbuffer'] = '../widgets/Cbuffer.js'; // Real Cbuffer; mocking up a Cbuffer is pointless

var Archon = require('./support/mockArchon.js');
var Axioms = require('../Axioms.js');
var XY = require('../widgets/XY.js').XY;

var setTemp = function(temp) { process.env['Sun.getTemperature'] = temp; };
var setTempTooHigh = function(archon) { setTemp(archon.genome.optimalTemp + archon.genome.tempRange); };
var setTempJustRight = function(archon) { setTemp(archon.genome.optimalTemp); };

describe("BrainStates", function() {
  describe("FindSafeTemp", function() {
    it("#construct", function() {
      var c = function() { new Archon(); };
      chai.expect(c).to.not.throw();
    });

    it("#start and give initial instructions", function() {
      var a = new Archon();
      var c = function() { a.tick(); };
      chai.expect(c).to.not.throw();
      chai.expect(a.brain.tempStateInstructions.action).equal('move');
    });

    it("#should behave when ticked in off state", function() {
      var archon = new Archon();

      archon.brain.currentAction.action = 'jumpInTheLake';
      archon.tick();

      chai.expect(archon.brain.tempStateInstructions).to.include({ action: 'n/a' });
    });
    
    it('#move only; no encystment if temp improves', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'findSafeTemp';
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
      
      setTempJustRight(archon);

      chai.expect(archon.brain.tempStateInstructions.action).equal('move');

      // tick a few extra times just to make sure it hasn't changed its mind
      for(var i = 0; i < 5; i++) {
        archon.tick(); chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
    });
    
    it('#move until time to give up, then order encyst', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'findSafeTemp';
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.tempStateInstructions.action).equal('encyst');
    });
    
    it('#order encyst, then allow move when temp improves', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'findSafeTemp';
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.tempStateInstructions.action).equal('encyst');
      
      setTempJustRight(archon);

      // Just one tick of better temp is ok -- maybe make a gene to tell us
      // how many ticks of better temp suffice to come out of cyst state
      archon.tick();
      chai.expect(archon.brain.tempStateInstructions.action).equal('move');
    });
    
    it('#reset when temp improves', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'findSafeTemp';
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.tempStateInstructions.action).equal('encyst');
      
      // Now the Cbuffer is full of bad temps; reset should clear it and
      // give us a move again instead of encyst
      setTempJustRight(archon);
      archon.tick();

      chai.expect(archon.brain.tempStateInstructions.action).equal('move');
    });
    
    it('#reset when brain says search is over', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'findSafeTemp';
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.tempStateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.tempStateInstructions.action).equal('encyst');

      // Leave temp high, but have the brain tell the state we
      // have other priorities
      archon.brain.currentAction.action = 'jumpInTheLake';
      archon.tick();  // So the brain will say we're done

      archon.brain.currentAction.action = 'findSafeTemp';
      archon.tick();  // State should reset at this point

      chai.expect(archon.brain.tempStateInstructions.action).equal('move');
    });
  });
  
  describe('SearchForFood', function() {
    it("#construct", function() {
      var c = function() { new Archon(); };
      chai.expect(c).to.not.throw();
    });
    
    it("#start and give initial instructions", function() {
      var a = new Archon();
      var c = function() { a.tick(); };
      chai.expect(c).to.not.throw();

      a.brain.currentAction = 'searchForFood';
      chai.expect(a.brain.foodSearchStateInstructions.action).equal('continue');
    });
    
    it('#continue up to first turn, then turn left', function() {
      var archon = new Archon();
      archon.brain.currentAction.action = 'searchForFood';
      
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns; i++) {
        archon.tick(); // Update; not time to turn yet; should say 'continue'
        chai.expect(archon.brain.foodSearchStateInstructions.action).equal('continue');
      }
      
      computerizedAngle = archon.velocity.getAngleFrom(0);

      // First turn is always left, add 7π/6
      robalizedAngle = Axioms.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6);

      computerizedAngle = Axioms.computerizeAngle(robalizedAngle);
      var xy = XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);

      archon.tick();
      chai.expect(archon.brain.foodSearchStateInstructions.action).equal('turn');
      chai.expect(archon.brain.foodSearchStateInstructions.dVelocity).equal(computerizedAngle); 
    });
    
    it('#continue up to second turn, then turn right', function() {
      var archon = new Archon(), xy = null, computerizedAngle = null, robalizedAngle = null;
      archon.brain.currentAction.action = 'searchForFood';
      
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns; i++) {
        archon.tick(); // Update; not time to turn yet; should say 'continue'
        chai.expect(archon.brain.foodSearchStateInstructions.action).equal('continue');
      }
      
      computerizedAngle = archon.velocity.getAngleFrom(0);

      // First turn is always left, add 7π/6
      robalizedAngle = Axioms.robalizeAngle(computerizedAngle) + (7 * Math.PI / 6);

      computerizedAngle = Axioms.computerizeAngle(robalizedAngle);
      xy = XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);

      archon.tick();
      chai.expect(archon.brain.foodSearchStateInstructions.action).equal('turn');
      chai.expect(archon.brain.foodSearchStateInstructions.dVelocity).equal(computerizedAngle);
      for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns; i++) {
        archon.tick(); // Update; not time to turn yet; should say 'continue'
        chai.expect(archon.brain.foodSearchStateInstructions.action).equal('continue');
      }
      
      computerizedAngle = archon.velocity.getAngleFrom(0);

      // First turn is always left, add 7π/6
      robalizedAngle = Axioms.robalizeAngle(computerizedAngle) - (7 * Math.PI / 6);

      computerizedAngle = Axioms.computerizeAngle(robalizedAngle);
      xy = XY.fromPolar(archon.genome.maxMVelocity, computerizedAngle);

      archon.tick();
      chai.expect(archon.brain.foodSearchStateInstructions.action).equal('turn');
      chai.expect(archon.brain.foodSearchStateInstructions.dVelocity).equal(computerizedAngle); 
    });
  });
});
