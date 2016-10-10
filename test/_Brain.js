var chai = require('chai');
var decache = require('decache');

decache('./support/mockArchon.js');

process.env['Brain'] = '../../Brain.js';

var Axioms = require('../Axioms.js');
var Archon = require('./support/mockArchon.js');

var spatialSenseNames = [ 'food', 'predator', 'prey', 'toxin' ];
var nonSpatialSenseNames = [ 'hunger' ];
var senseNames = spatialSenseNames.concat(nonSpatialSenseNames, [ 'temperature' ]);

var zeroSensors = function(archon) {
  var i = null;
  
  for(i = 0; i < senseNames.length; i++) {
    setSensorSignalWeight(archon, 0, senseNames[i]);
  }
};

// Our fake sensor array has only one sensor in it, so there's
// no need for looping through to fill a bunch of sensors
var setSensorSignalWeight = function(archon, value, senseName) {
  var fn = 'sense' + senseName.substr(0, 1).toUpperCase() + senseName.substr(1);
  archon.brain[fn](0, value);
};

var setSensorDirection = function(archon, direction, senseName) {
  archon.brain.sensesPhenotype[senseName].sensorArray.setDirection(direction);
};

describe('Brain', function() {
  it('#construct', function() {
    var c = function() { new Archon(); }
    chai.expect(c).to.not.throw();
  });
  
  it('#launch, tick', function() {
    var c = function() { var a = new Archon(); a.launch(); };
    var d = function() { var a = new Archon(); a.launch(); a.tick(); };
    chai.expect(c).to.not.throw();
    chai.expect(d).to.throw(Error, "Sensors should never be empty");
  });
  
  it('#single sense, no competition', function() {
    var archon = new Archon(); archon.launch();
    
    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'hunger');
    
    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('searchForFood');
  });
  
  it('#multiple competing senses - overwhelm the inertial damper', function() {
    var archon = new Archon(); archon.launch();
    
    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'temperature');
    setSensorSignalWeight(archon, 0.5, 'food');
    
    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('findSafeTemp');

    setSensorSignalWeight(archon, 0.5, 'temperature');
    setSensorSignalWeight(archon, 1, 'food');
    
    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('eat');
  });
  
  it('#multiple competing senses - inertial damper in play', function() {
    var archon = new Archon(); archon.launch();
    var action = null;
    
    archon.genome.inertialDamper = 0.02;
    
    zeroSensors(archon);
    setSensorSignalWeight(archon, 0.05, 'predator');
    setSensorSignalWeight(archon, 0.04, 'food');
    
    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('flee');
    
    setSensorSignalWeight(archon, 0.05, 'food');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('flee');
    
    setSensorSignalWeight(archon, 0.06, 'food');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('flee');
    
    setSensorSignalWeight(archon, 0.07, 'food');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('flee');
    
    setSensorSignalWeight(archon, 0.08, 'food');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('eat');
  });
  
  it('#start moving if stationary when food search says continue', function() {
    var archon = new Archon(); archon.launch();

    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'hunger');
    
    // Stop altogether; when food search says
    // continue, we should start moving
    archon.setMVelocity(0);

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('searchForFood');
    chai.expect(archon.mVelocity.getMagnitude()).not.equal(0);
  });
  
  it('#turn when food search says to turn', function() {
    var archon = new Archon(); archon.launch();

    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'hunger');
    
    archon.setMVelocity(42, 137); // Move in some random direction

    setSensorSignalWeight(archon, 1, 'hunger');
    archon.brain.state_searchForFood.setReturn({ action: 'move', dVelocity: Math.PI / 3});

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('searchForFood');
    chai.expect(archon.mVelocity.getAngleFrom(0)).equal(Math.PI / 3);
  });
  
  it('#go where temp sensor says to go', function() {
    var archon = new Archon(); archon.launch();

    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'temperature');
    setSensorDirection(archon, 1, 'temperature');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('findSafeTemp');
    chai.expect(archon.mVelocity.getAngleFrom(0)).equal(Math.PI / 2);

    setSensorDirection(archon, 0, 'temperature');

    archon.tick();
    chai.expect(archon.brain.currentAction.action).equal('findSafeTemp');
    chai.expect(archon.mVelocity.getAngleFrom(0)).equal(-Math.PI / 2);
  });
  
  it('#go where other spatial sensors say to go', function() {
    var archon = new Archon(); archon.launch();
    var sensorDomain = 2 * Math.PI / 12, whichSensor = null;

    zeroSensors(archon);
    setSensorSignalWeight(archon, 1, 'predator');
    
    for(whichSensor = 0; whichSensor < 12; whichSensor++) {
      setSensorDirection(archon, whichSensor, 'predator');
      
      archon.tick();
      chai.expect(archon.brain.currentAction.action).equal('flee');
      
      // screwing around with the angles so I can do simple add/subtract
      var lo = (whichSensor * sensorDomain) - 1e-5 + (2 * Math.PI);
      var hi = (whichSensor * sensorDomain) + 1e-5 + (2 * Math.PI);
      var a = Axioms.robalizeAngle(archon.mVelocity.getAngleFrom(0));
      
      chai.expect(a).within(lo, hi);
    }
  });
});