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
  this.gnatfly = new Archonia.Form.Gnatfly(this);
  this.goo = new Archonia.Form.Goo(this);
  this.legs = new Archonia.Form.Legs(this);
  
  this.bonsaiDescriptors = [
    { ix: 0, distance: 0, producingPollen: 0, contender: false },
    { ix: 1, distance: 0, producingPollen: 0, contender: false },
    { ix: 2, distance: 0, producingPollen: 0, contender: false }
  ];
  
  this.currentBonsaiTarget = null;
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
    this.gnatfly.launch();
    this.legs.launch(45);
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

    this.drone.launch(this.state.archonUniqueId, 1, x, y);
  },

  senseManna: function(bonsai) {
    var d = this.state.position.getDistanceTo(bonsai.sprite);
    if(d < Archonia.Axioms.avatarRadius + bonsai.sprite.width) {
      var manna = { calories: bonsai.giveNectar() };
      this.goo.eat(manna);
      this.state.sensedManna = [ ];
    } else {
      this.senses.senseManna(bonsai.sprite);
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
      mass: 1,
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
    
    for(var i = 0; i < 3; i++) {
      this.senseManna(Archonia.Cosmos.TheBonsai[i]);
    }

    this.senses.tick();
    this.gnatfly.tick();
    this.goo.tick();
    
    if(this.state.frameCount % 60 === 0) { this.legs.setTargetPosition(this.state.targetPosition.targetPosition); }
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