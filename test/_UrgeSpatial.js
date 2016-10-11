var chai = require('chai');
var decache = require('decache');

var Axioms = require('../Axioms.js');
var UrgeSpatial = require('../urges/UrgeSpatial.js');
var XY = require('../widgets/XY.js').XY;

var Brain = function(urge) {
  this.archoniaUniqueID = 1;

  this.urge = urge;
  this.urge2 = urge2;
};

Brain.prototype = {
  chooseUrge: function() {
    var sig = this.urge.getBestSignal(); var sig2 = this.urge2.getBestSignal();
    
    if(sig > sig2) {this.urge2.disable(); this.urge.enable(); }
    else { this.urge.disable(); this.urge2.enable(); }
  },
    
  enableUrge: function() { this.urge.enable(); },
  register: function(urge) { if(this.urge === undefined) { this.urge = urge; } else { this.urge2 = urge; } },
  tick: function() { this.urge.tick(); if(this.urge2 !== undefined) { this.urge2.tick(); } }
};

var fn = null;
var multiplier = null;
var velocityControl = XY();
var brain = new Brain();
var urge = null, urge2 = null;
var urgeTowardSense = true;
var senseGenes = {};
var expectedResult = null;
var signalAveragingSpread = 3;
var measurementDepth = 10;
var maxMVelocity = 15;

var frameCount = 0;
var tick = function(brain) { brain.tick(frameCount++); };

process.env["SensorArray.uniqueID"] = 0;  // Get the mock sensor array going

describe("UrgeSpatial", function() {
  it("#construct", function() {
    fn = function() { urge = new UrgeSpatial(); };
    chai.expect(fn).to.throw(Error, "Bad args");

    fn = function() { urge = new UrgeSpatial(urgeTowardSense); };
    chai.expect(fn).to.throw(Error, "Bad args");

    fn = function() { urge = new UrgeSpatial(urgeTowardSense, brain); };
    chai.expect(fn).to.throw(Error, "Bad args");

    fn = function() { urge = new UrgeSpatial(urgeTowardSense, brain, senseGenes); };
    chai.expect(fn).to.throw(Error, "Bad args");

    fn = function() { urge = new UrgeSpatial(urgeTowardSense, brain, senseGenes, velocityControl); };
    chai.expect(fn).to.throw(Error, "Bad args");
    
    senseGenes = {
      inertialDamper: 0.02, measurementDepth: 10, signalMultiplier: 1, decayRate: 0.02,
      valuesRangeLo: 0, valuesRangeHi: 1, maxMVelocity: maxMVelocity
    }
      
    fn = function() { urge = new UrgeSpatial(urgeTowardSense, brain, senseGenes, velocityControl, measurementDepth); };
    chai.expect(fn).to.not.throw();
    
    chai.expect(brain).to.have.a.property('urge').that.has.a.property('tick');
  });
  
  it("#ignore tick when disabled", function() {
    var signal = { weight: 42, direction: 3 };

    // Tell SA to return 2, meaning the directly vertical sensor;
    // the urge should translate this into a movement target and
    // aim us straight up
    process.env["SensorArray(0).signal"] = JSON.stringify(signal);

    senseGenes = {
      inertialDamper: 0.02, measurementDepth: 10, signalMultiplier: 0.5, decayRate: 0.02,
      valuesRangeLo: 0, valuesRangeHi: 1, maxMVelocity: maxMVelocity
    };
    
    urge2 = new UrgeSpatial(urgeTowardSense, brain, senseGenes, velocityControl, measurementDepth);
    
    velocityControl.set(0);

    // Point urge2 straight down and give it the stronger signal
    var signal = { weight: 42, direction: 9 };
    process.env["SensorArray(1).signal"] = JSON.stringify(signal);
    
    brain.chooseUrge();

    tick(brain);
    chai.expect(velocityControl.x.toFixed(4)).equal((0).toFixed(4));
    chai.expect(velocityControl.y.toFixed(4)).equal((-maxMVelocity).toFixed(4));
  });
  
  it('#set velocityControl on tick when enabled', function() {
    var signal = { weight: 42, direction: 3 };
    velocityControl.set(0);

    // Tell SA to return 2, meaning the directly vertical sensor;
    // the urge should translate this into a movement target and
    // aim us straight up
    process.env["SensorArray(0).signal"] = JSON.stringify(signal);

    brain.enableUrge();

    tick(brain);
    chai.expect(velocityControl.x.toFixed(4)).equal((0).toFixed(4));
    chai.expect(velocityControl.y.toFixed(4)).equal((-maxMVelocity).toFixed(4));
  });
  
  it("#return signal strength * multiplier", function() {
    senseGenes = {
      inertialDamper: 0.02, measurementDepth: 10, signalMultiplier: 2, decayRate: 0.02,
      valuesRangeLo: 0, valuesRangeHi: 1, maxMVelocity: maxMVelocity
    };
    
    velocityControl.set(0);
    
    urge2 = new UrgeSpatial(urgeTowardSense, brain, senseGenes, velocityControl, measurementDepth);

    // Point urge2 straight down and give it the stronger signal
    var signal = { weight: 42, direction: 9 };
    process.env["SensorArray(2).signal"] = JSON.stringify(signal);
    
    brain.chooseUrge();

    tick(brain);
    chai.expect(velocityControl.x.toFixed(4)).equal((0).toFixed(4));
    chai.expect(velocityControl.y.toFixed(4)).equal((maxMVelocity).toFixed(4));
  });
});