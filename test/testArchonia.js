var chai = require('chai');
var should = chai.should();
var data_driven = require('data-driven');

var Axioms = require('../Axioms.js');
var Archotype = require('../Archonia.js');
var Phaser = require('./support/Phaser.js');

var angles = [
  { in: 0, out: 0, p: "   0" }, { in: Math.PI / 2, out: Math.PI / 2, p: "   π/2"},
  { in: -Math.PI / 2, out: -Math.PI / 2, p: "  -π/2"},
  { in: Math.PI, out: -Math.PI, p: "   π" },
  { in: 3 * Math.PI / 2, out: -Math.PI / 2, p: "  3π/2"},
  { in: -3 * Math.PI / 2, out: Math.PI / 2, p: " -3π/2"},
  { in: Math.PI * 2, out: 0, p: "  2π"}, { in: Math.PI * 4, out: 0, p: "  4π"},
  { in: -Math.PI * 2, out: 0, p: " -2π"}, { in: -Math.PI * 4, out: 0, p: " -4π"},
  { in: 7 * Math.PI / 6, out: -5 * Math.PI / 6, p: "  7π/6"},
  { in: Math.PI / 3, out: Math.PI / 3, p:    "   π/3"}
];

var A = new Archotype.Archonia(); A.go();

describe("Archonia", function() {
  
  describe("#static functions", function() {
    describe('#computerize/robalize', function() {
      data_driven(angles, function() {
        it('#{p}', function(pair) {
          chai.expect(Axioms.computerizeAngle(Axioms.robalizeAngle(pair.in)).toFixed(8)).equal(pair.out.toFixed(8));
        })
      });
    });
  });
    
  describe('#Game state started, run create()', function() {
    it('#pass create step', function() {
      A.game.state.create();
    
      should.equal(A.game.physics.started, true);
    });
  });
  
});
