var chai = require("chai");

process.env['BrainStates.Cbuffer'] = '../widgets/Cbuffer.js'; // Real Cbuffer; mocking up a Cbuffer is pointless

var Archon = require('./support/mockArchon.js');

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
      chai.expect(a.brain.stateInstructions.action).equal('move');
    });
    
    it('#move only; no encystment if temp improves', function() {
      var archon = new Archon();
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.stateInstructions.action).equal('move');
      }
      
      setTempJustRight(archon);

      chai.expect(archon.brain.stateInstructions.action).equal('move');

      // tick a few extra times just to make sure it hasn't changed its mind
      for(var i = 0; i < 5; i++) {
        archon.tick(); chai.expect(archon.brain.stateInstructions.action).equal('move');
      }
    });
    
    it('#move until time to give up, then order encyst', function() {
      var archon = new Archon();
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.stateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.stateInstructions.action).equal('encyst');
    });
    
    it('#order encyst, then allow move when temp improves', function() {
      var archon = new Archon();
      
      setTempTooHigh(archon);
      archon.tick();  // To get the state started
      
      for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
        archon.tick(); // Update; we haven't hit the wait limit; say 'move'
        chai.expect(archon.brain.stateInstructions.action).equal('move');
      }
      
      archon.tick(); // This should push us over the limit
      chai.expect(archon.brain.stateInstructions.action).equal('encyst');
      
      setTempJustRight(archon);

      // Just one tick of better temp is ok -- maybe make a gene to tell us
      // how many ticks of better temp suffice to come out of cyst state
      archon.tick();
      chai.expect(archon.brain.stateInstructions.action).equal('move');
    });
  });
});
