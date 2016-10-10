var chai = require("chai");
var Archon = require('./support/mockArchon.js');

describe("BrainStates", function() {
  describe("FindSafeTemp", function() {
    it("#construct", function() {
      var c = function() { new Archon(); };
      chai.expect(c).to.not.throw();
    });

    it("#start and give instructions", function() {
      var a = new Archon();
      var c = function() { a.tick(); };
      chai.expect(c).to.not.throw();
      chai.expect(a.brain.stateInstructions.action).equal('move');
    });
  });
});
