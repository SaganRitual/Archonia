/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var Archon = function() {
  this.hasLaunched = false;
  
  this.drone = Archonia.Cosmos.Dronery.getDrone();

  this.color = new Color(this);

  Archonia.Cosmos.Genomery.genomifyMe(this); // No inheritance here; just getting a skeleton genome
  Archonia.Cosmos.Statery.statifyMe(this);

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
  
    this.state.frameCount = Archonia.Axioms.integerInRange(0, 60);

    Archonia.Cosmos.Genomery.inherit(this, myParentArchon);

    this.senses.launch();
    this.forager.launch();
    this.legs.launch();
    this.goo.launch();

    var x = null, y = null;

    if(myParentArchon === undefined) {
      x = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.width - 20);
      y = Archonia.Axioms.integerInRange(20, Archonia.Engine.game.height - 20);

      this.myParentArchonId = 0;
      Archonia.Cosmos.FamilyTree.addMe(this.state.archonUniqueId, 'god');
    } else {
      x = myParentArchon.position.x; y = myParentArchon.position.y;

      this.state.position.set(myParentArchon.position);
      this.state.velocity.set(myParentArchon.velocity).timesScalar(-1);
      this.myParentArchonId = myParentArchon.state.archonUniqueId;
  
      Archonia.Cosmos.FamilyTree.addMe(this.state.archonUniqueId, myParentArchon.state.archonUniqueId);
    }

    this.drone.launch(this.state.archonUniqueId, this.genome.sensorScale, x, y);
  },

  senseSkinnyManna: function(manna) {
    var d = this.state.position.getDistanceTo(manna);
    if(d < Archonia.Axioms.avatarRadius + manna.width) {
      this.goo.eat(manna);
      manna.kill();
    } else {
      this.senses.senseSkinnyManna(manna);
    }
  },

  startTween: function() {},

  tick: function() {
    this.state.frameCount++;

    this.senses.tick();
    this.forager.tick();
    this.goo.tick();
    this.legs.tick();
    this.drone.setColor(this.genome.color);
  },

  toggleMotion: function() { if(this.moving) { this.legs.stop(); } this.moving = !this.moving; }
};

var Color = function(archon) {
  this.h = 0;
  this.s = 0;
  this.L = 0;
  this.archon = archon;
};

Color.prototype = {
  getColorAsDecimal: function() {
    var hslString = "hsl(" + this.h + ", " + this.s + "%, " + this.L + "%)";
    return parseInt(tinycolor(hslString).toHex(), 16);
  },

  stopTween: function(_this) {
    _this.archon.tweening = false;
  }
};

Archonia.Form.Archon = Archon;

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Archon;
}