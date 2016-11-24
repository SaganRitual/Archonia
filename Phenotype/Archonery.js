/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var archonUniqueId = 0;
var archonPool = [];

var breed = function(parent) {
  var archon = getArchon();

  try { launchArchon(archon, parent); }
  catch(e) {
    if(e instanceof Archonia.Essence.BirthDefect) {
      console.log("Birth defect: " + e.message); archon.die();
    } else {
      Archonia.Essence.hurl(e);
    }
  }
};

var getArchon = function() {
  var archon = null;
  
  for(var i = 0; i < archonPool.length; i++) {
    var a = archonPool[i];
    if(a.available) { archon = a; break; }
  }
  
  if(archon === null) {
    archon = new Archonia.Form.Archon();
    archonPool.push(archon);
  }
  
  return archon;
};

var getArchonById = function(archonUniqueId) {
  var archon = archonPool.find(function(e) {
    return e.state.archonUniqueId === archonUniqueId;
  });
  
  return archon;
};

var launchArchon = function(archon, parent) {
  archon.state.archonUniqueId = archonUniqueId++; archon.launch(parent);
};

Archonia.Cosmos.Archonery = {
  acceptSoul: function(archonUniqueId) {
    getArchonById(archonUniqueId).die();
  },
  
  breed: function(parentId) { var p = getArchonById(parentId); breed(p); },
  
  getArchonById: function(id) { return getArchonById(id); },
  
  senseManna: function(manna, sensor) {
    var a = Archonia.Cosmos.Archonery.getArchonById(sensor.archonUniqueId);
    a.senseManna(manna);
  },
  
  // Baffling: the args order should be sensor, vent, as far as
  // I can tell, based on the way we're calling the Phaser overlap
  // function. But this works, so I guess I'll worry about it later
  senseVent: function(vent, sensor) { var diner = getArchonById(sensor.archonUniqueId); diner.senseVent(); },
  
  start: function() {
    Archonia.Cosmos.momentOfCreation = true;

    Archonia.Engine.TheDronery.start();
    for(var i = 0; i < Archonia.Axioms.archonCount; i++) { breed(); }

    Archonia.Cosmos.momentOfCreation = false;
  },
  
  tick: function() {
    Archonia.Engine.TheDronery.tick();
    for(var i = 0; i < archonPool.length; i++) { if(archonPool[i].hasLaunched) { archonPool[i].tick(); } }
  }
};

})(Archonia);
