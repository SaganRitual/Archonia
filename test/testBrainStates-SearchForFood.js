var chai = require('chai');
var data_driven = require('data-driven');

var Archonia = {
  Form: {
    Axioms: require('../Axioms.js')
  }
};

var BrainStates = require('../widgets/BrainStates.js');

var XY = require('../widgets/XY.js').XY;

var archon = {
  genome: { foodSearchTimeBetweenTurns: 15 }, // Any number will do for our test
  phenotype: { getSize: function() { return 42; } }
};

var Brain = function(archon) {
  this.archon = archon;
  this.searchForFood = new BrainStates.SearchForFood(this);
  
  this.frameCount = 0;
  this.state = null;
  this.ackValue = null;
  
  this.velocity = XY();
  this.action = null;
};

Brain.prototype = {
  ack: function(ackValue) {
    switch(this.state) {
      case 'searchForFood': this.searchForFood.ack(ackValue); break;
    }
    
    this.ackValue = null;
  },
  
  chooseAction: function() {
    switch(this.state) {
      case 'searchForFood': this.action = this.searchForFood.chooseAction(); break;
    }
    
    return this.action;
  },
  
  startSearchForFood: function() { this.searchForFood.start(); this.state = 'searchForFood'; },
  
  tick: function() {
    this.frameCount++;
    this.searchForFood.tick(this.frameCount);
  }
};

var theBrain = null;

var checkTurn = function(turnAngle, direction, start) {
  var computerizedAngle = null, robalizedAngle = null, xy = XY(), r = archon.phenotype.getSize(), a = null;
  
  a = theBrain.chooseAction();
  chai.expect(a).to.have.property('action', 'continue');
  
  // We just started the search and ticked once; need to tell
  // the state that we've obeyed, unless, of course, this is
  // from when we call this function a second time, continuing
  // to a second turn rather than starting from stationary
  if(start) { theBrain.ack('start'); }

  for(var i = 0; i < archon.genome.foodSearchTimeBetweenTurns; i++) {
    theBrain.tick();
    a = theBrain.chooseAction();
    chai.expect(a).to.have.property('action', 'continue');
  }

  computerizedAngle = theBrain.velocity.getAngleFrom(0);

  // First turn is always left, add 7π/6
  robalizedAngle = Archonia.Form.Axioms.robalizeAngle(computerizedAngle) + (turnAngle * direction);

  computerizedAngle = Archonia.Form.Axioms.computerizeAngle(robalizedAngle);
  xy.set(XY.fromPolar(r, computerizedAngle));
  
  theBrain.tick();
  theBrain.tick();
  a = theBrain.chooseAction();
  chai.expect(a).to.have.property('action', 'turn');
  chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('x').equal(xy.x);
  chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('y').equal(xy.y);
  
  theBrain.ack('turn');
  a = theBrain.chooseAction();
  chai.expect(a).to.have.property('action', 'continue');
}

describe('BrainStates', function() {
  
  describe('#Smoke test', function() {
    it('#construct', function() {
      chai.expect(function() { theBrain = new Brain(archon); }).to.not.throw();
    });
  });
  
  describe('#searchForFood', function() {
    it('#bad ack should throw', function() {
      theBrain = new Brain(archon);
      theBrain.startSearchForFood();
      theBrain.ackValue = null;

      chai.expect(function() { theBrain.ack(null); }).to.throw(Error, 'out of order');
    });
    
    it('#initial movement target from stationary', function() {
      theBrain = new Brain(archon);

      theBrain.velocity.set(0);
      theBrain.startSearchForFood();

      var a = theBrain.chooseAction();

      chai.expect(a).to.have.property('action', 'setMoveTarget');
      chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('x').that.is.a('number');
      chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('y').that.is.a('number');
      
      theBrain.tick();

      a = theBrain.chooseAction();  // We didn't ack the start, so he should keep giving us start instructions
      chai.expect(a).to.have.property('action', 'setMoveTarget');
      chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('x').that.is.a('number');
      chai.expect(a).to.have.property('moveTo').that.is.an('object').with.property('y').that.is.a('number');
      
      theBrain.ack('start');
      theBrain.tick();
      
      a = theBrain.chooseAction(); // We've acked the start, so now we should get continue
      chai.expect(a).to.have.property('action', 'continue');
    });
    
    it('#initial movement target from moving', function() {
      theBrain = new Brain(archon);

      theBrain.velocity.set(42, 137);
      theBrain.startSearchForFood();

      var a = theBrain.chooseAction();
      chai.expect(a).to.have.property('action', 'continue');
    });
    
    it('#time to turn; leftie first', function() {
      theBrain = new Brain(archon);
      theBrain.velocity.set(42, 137);
      theBrain.startSearchForFood();
      theBrain.tick();

      checkTurn(7 * Math.PI / 6, 1, true);
    });
    
    it('#complain about acking the turn too much', function() {
      theBrain = new Brain(archon);
      theBrain.velocity.set(42, 137);
      theBrain.startSearchForFood();
      theBrain.tick();

      checkTurn(7 * Math.PI / 6, 1, true);
      chai.expect(function() { theBrain.ack('turn'); }).to.throw(Error, 'out of order');
    });
    
    it('#time to turn, right this time', function() {
      theBrain = new Brain(archon);
      theBrain.velocity.set(42, 137);
      theBrain.startSearchForFood();
      theBrain.tick();

      checkTurn(7 * Math.PI / 6, 1, true);
      checkTurn(7 * Math.PI / 6, -1, false);

      theBrain.tick();
      var a = theBrain.chooseAction();
      chai.expect(a).to.have.property('action', 'continue');
    });
  });

});
