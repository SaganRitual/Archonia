var chai = require('chai');
var data_driven = require('data-driven');

var BrainStates = require('../widgets/BrainStates.js');
var XY = require('../widgets/XY.js').XY;

var Axioms = require('../Axioms.js');

var A = { sun: { getTemperature: function(where) { return where.y; } } };

var archon = { genome: { optimalTemp: -200, optimalTempRange: 400, howLongBadTempToEncystment: 60 } };

var Brain = function(archon) {
  this.archon = archon;
  this.position = XY();
  
  this.getTemperature = A.sun.getTemperature;
};

var theBrain = new Brain(archon);

var trackFromHereToThere = function(from, to) {
  var t = new BrainStates.FindSafeTemp(theBrain);
  var r = null;
  
  t.start();
  for(var i = from; i < to; i++) {
    theBrain.position.set(0, i);

    t.tick();
    r = t.chooseAction();
    
    chai.expect(r).equal('move');
  }
  
  return t;
};

describe("BrainStates - FindSafeTemp", function() {
  it("#track until not needed", function() {
    trackFromHereToThere(-200, 0);
  });
  
  it('#stuck at top or bottom: encyst', function() {
    // move until we're at the limit of our tolerable temp range
    var t = trackFromHereToThere(-200, 0);
    
    // at our limit, unable to move further, tolerate temp
    // until we reach our genetic time limit
    for(var i = 0; i < archon.genome.howLongBadTempToEncystment - 1; i++) {
      theBrain.position.set(0, 0);

      t.tick();
      r = t.chooseAction();
    
      chai.expect(r).equal('move');
    }
    
    // stuck too long, temp not improving, encyst
    t.tick();
    r = t.chooseAction();
    chai.expect(r).equal('encyst');
  });

  it("#can't outrun increasing bad temp", function() {
    trackFromHereToThere(-200, 0);

    var radius = archon.genome.optimalTempRange / 2;
    var limit = archon.genome.optimalTemp + radius;
    
    // move until we're at the limit of our tolerable temp range
    var t = trackFromHereToThere(archon.genome.optimalTemp, limit);
    
    // at our limit, tolerate it until we reach our genetic limit
    for(var i = limit; i < limit + archon.genome.howLongBadTempToEncystment - 1; i++) {
      theBrain.position.set(0, i);

      t.tick();
      r = t.chooseAction();
    
      chai.expect(r).equal('move');
    }
    
    // still able to move, but outside our tolerable range too long
    t.tick();
    r = t.chooseAction();
    chai.expect(r).equal('encyst');
  });
});