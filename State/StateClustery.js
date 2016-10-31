/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Proxy */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

if(typeof window === "undefined") {
  Archonia.Essence = require("../Essence.js");
}

(function(Archonia) {
  
var stateClustery = {
  
  makeStateneCluster: function(statome, whichCluster) {
    var handlerName = "cluster_" + whichCluster;
    
    if(!(handlerName in stateClustery)) { Archonia.Essence.hurl(new Error("No statene cluster for '" + whichCluster + "'")); }

    return new Proxy(statome, stateClustery[handlerName]);
  },
  
  getStatene: function(component, statome, whichStatene) {
    stateClustery.throwIfNotPresent(statome, whichStatene);
    stateClustery.throwIfNotAccessible(component, whichStatene);
    return statome[whichStatene];
  },
  
  setStatene: function(component, statome, whichStatene, v) {
    stateClustery.throwIfNotPresent(statome, whichStatene);
    stateClustery.throwIfNotAccessible(component, whichStatene);
    statome[whichStatene] = v;
    return true;  // Tell proxy everything went ok
  },
  
  throwIfNotAccessible: function(component, statene) {
    if(component !== "archon" && component !== "head") {
      var handlerName = "cluster_" + component;
      var valid = stateClustery[handlerName].valid;
    
      if(valid.indexOf(statene) === -1) {
        throw Error("Component '" + component + "' has no access to statene '" + statene + "'");
      }
    }
  },
  
  throwIfNotPresent: function(target, name) {
    if(!(name in target)) { Archonia.Essence.hurl(new Error("No such statene '" + name + "'")); }
  },

  // Archon gets to see everything
  cluster_archon: {
    get: function(statome, statene) {  return stateClustery.getStatene("archon", statome, statene); },
    set: function(statome, statene, v) { return stateClustery.setStatene("archon", statome, statene, v); }
  },

  // Head gets to see everything
  cluster_head: {
    get: function(statome, statene) {  return stateClustery.getStatene("head", statome, statene); },
    set: function(statome, statene, v) { return stateClustery.setStatene("head", statome, statene, v); }
  },
  
  cluster_goo: {
    valid: [ "beingPoisoned", "encysted", "position", "velocity" ],
    get: function(statome, statene) {  return stateClustery.getStatene("goo", statome, statene); },
    set: function(statome, statene, v) { return stateClustery.setStatene("goo", statome, statene, v); }
  },
  
  cluster_legs: {
    valid: [ "frameCount", "position", "velocity" ],
    get: function(statome, statene) {  return stateClustery.getStatene("legs", statome, statene); },
    set: function(statome, statene, v) { return stateClustery.setStatene("legs", statome, statene, v); }
  },
  
  cluster_senses: {
    valid: [ "hungerInput", "sensedArchons", "sensedSkinnyManna", "tempInput" ],
    get: function(statome, statene) {  return stateClustery.getStatene("senses", statome, statene); },
    set: function(statome, statene, v) { return stateClustery.setStatene("senses", statome, statene, v); }
  }

};

Archonia.Cosmos.StateClustery = stateClustery;
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.StateClustery;
}
