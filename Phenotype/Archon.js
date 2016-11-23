/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var Archon = function() {
  this.hasLaunched = false;
  
  this.setupState();

  Archonia.Cosmos.TheGenomery.genomifyMe(this); // No inheritance here; just getting a skeleton genome
  
  this.drone = Archonia.Engine.TheDronery.getDrone(this);

  this.state.position = new Archonia.Form.Archonoid(this.drone.sensor.body.center);
  this.state.velocity = new Archonia.Form.Archonoid(this.drone.sensor.body.velocity);

  this.senses = new Archonia.Form.Senses(this);
  this.goo = new Archonia.Form.Goo(this);
  this.legs = new Archonia.Form.Legs(this);
  this.forager = new Archonia.Form.Forager(this);
};

Archon.prototype = {
  decohere: function() {
    this.drone.decohere();
    this.available = true;
    this.hasLaunched = false;
  },
  
  die: function() {
    console.log(this.state.archonUniqueId, "decohere");
    this.decohere();  // For now; I'll come back to rotting corpses later
  },

  launch: function(myParentArchon) {
    this.available = false;
    this.hasLaunched = true;
    this.state.firstTickAfterLaunch = true;
  
    this.state.frameCount = Archonia.Axioms.integerInRange(0, 60);

    Archonia.Cosmos.TheGenomery.inherit(this, myParentArchon);

    this.senses.launch();
    this.forager.launch();
    this.legs.launch();
    this.goo.launch();

    var x = null, y = null;

    if(myParentArchon === undefined) {
      x = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.width - 20);
      y = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.height - 20);

      this.myParentArchonId = 0;
      Archonia.Cosmos.TheFamilyTree.addMe(this.state.archonUniqueId, 'god');
    } else {
      x = myParentArchon.state.position.x; y = myParentArchon.state.position.y;

      this.state.position.set(myParentArchon.position);
      this.state.velocity.set(myParentArchon.velocity).timesScalar(-1);
      this.myParentArchonId = myParentArchon.state.archonUniqueId;
  
      Archonia.Cosmos.TheFamilyTree.addMe(this.state.archonUniqueId, myParentArchon.state.archonUniqueId);
    }

    this.drone.launch(this.state.archonUniqueId, this.genome.sensorScale, x, y);
  },

  senseManna: function(manna) {
    var d = this.state.position.getDistanceTo(manna);
    if(d < Archonia.Axioms.avatarRadius + manna.width) {
      this.goo.eat(manna);
      manna.kill();
    } else {
      this.senses.senseManna(manna);
    }
  },
  
  setupState: function() {
    this.state = {
      adultCalorieBudget: null,
      archonUniqueId: null,
      beingPoisoned: null,
      embryoCalorieBudget: null,
      encysted: null,
      firstTickAfterLaunch: null,
      frameCount: null,
      hungerInput: null,
      larvalCalorieBudget: null,
      position: null,
      sensedManna: null,
      targetPosition: new TargetPosition(),
      tempInput: null,
      velocity: null,
      where: Archonia.Form.XY(),
    };
  },

  startTween: function() {},

  tick: function() {
    this.state.frameCount++;

    this.senses.tick();
    this.forager.tick();
    this.goo.tick();
    this.legs.tick();
    this.drone.tick();

    this.state.firstTickAfterLaunch = false;
  },

  toggleMotion: function() { if(this.moving) { this.legs.stop(); } this.moving = !this.moving; }
};

var TargetPosition = function() {
  this.targetPosition = Archonia.Form.XY();
  
  this.clear();
};

TargetPosition.prototype = {
  clear: function() { this.dirty = false; },
  
  get: function() { if(this.dirty) { return this.targetPosition; } else { return false; } },
  
  set: function(targetPosition, damper, damperDecay) {
    this.targetPosition.set(targetPosition);
    this.damper = damper; this.damperDecay = damperDecay;
  
    this.dirty = true;
  }
};

Archonia.Form.Archon = Archon;

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}