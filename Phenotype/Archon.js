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
  
  this.bonsaiDescriptors = [
    { ix: 0, distance: 0, producingPollen: 0, contender: false },
    { ix: 1, distance: 0, producingPollen: 0, contender: false },
    { ix: 2, distance: 0, producingPollen: 0, contender: false }
  ];
  
  this.currentBonsaiTarget = null;
};

Archon.prototype = {
  checkBonsai: function() {
    var i = null;

    for(i = 0; i < 3; i++) {
      var bd = this.bonsaiDescriptors[i];
      var ix = bd.ix;
      var theBonsai = Archonia.Cosmos.TheBonsai[ix];
      
      bd.distance = this.state.position.getDistanceTo(theBonsai.sprite);
      bd.producingPollen = theBonsai.getPollenLevel(this.state.position) > 0;
      
      if(this.currentBonsaiTarget === null) { bd.contender = true; }
    }
    
    this.bonsaiDescriptors.sort(function(a, b) { return a.distance > b.distance; });
    
    var c = this.bonsaiDescriptors.find(function(e) { return e.producingPollen && e.contender; });
    
    if(c === undefined) {
      Archonia.Essence.TheLogger.log("All contenders");
      for(i = 0; i < 3; i++) { this.bonsaiDescriptors[i].contender = true; }
      this.currentBonsaiTarget = null;
    } else {
      if(c.ix !== this.currentBonsaiTarget) {
        if(this.currentBonsaiTarget !== null) {
          Archonia.Essence.TheLogger.log("Disqualifying target " + this.currentBonsaiTarget);
          var t = this.currentBonsaiTarget;
          this.bonsaiDescriptors.find(function(e) { return e.ix === t; }).contender = false;
        }

        Archonia.Essence.TheLogger.log("New target " + c.ix);
        this.currentBonsaiTarget = c.ix;
      }
    }
    
    if(this.currentBonsaiTarget !== null) {
      this.senseManna(Archonia.Cosmos.TheBonsai[this.currentBonsaiTarget]);
    }
  },
  
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
    
    this.checkBonsai();

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