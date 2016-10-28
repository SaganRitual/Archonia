/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.TouchState = function(headState) {
  this.headState = headState;

  this.active = false;
  this.newState = false;
  this.tween = null;

  this.interaction = "";
  this.touchedArchons = [];
  
  this.relationshipHierarchy = [ "prey", "poisoner", "poisoned", "predator" ];
  
  this.currentEngagement = { hisId: null, relationship: "" };
  this.relationships = { poisoned: [], poisoner: [], predator: [], prey: [] };
};

Archonia.Form.TouchState.prototype = {

computeTouchInteraction: function(checkArchonId, myMass) {
  var checkArchon = Archonia.Cosmos.Dronery.getArchonById(checkArchonId);
  
  if(checkArchon === null) { return ""; } // Sometimes they die before we can check them
  
  var iAmThePoisoner = this.headState.genome.toxinStrength > checkArchon.genome.toxinResistance;
  var iAmThePoisoned = checkArchon.genome.toxinStrength > this.headState.genome.toxinResistance;

  var hisMass = checkArchon.goo.getMass();
  var iAmThePredator = myMass * this.headState.genome.predationRatio > hisMass;
  var iAmThePrey = hisMass * checkArchon.genome.predationRatio > myMass;

  var interaction = null;
  if(iAmThePredator) {
    if(iAmThePoisoned) { interaction = "poisoned"; } else { interaction = "predator"; }
  } else if(iAmThePrey) {
    if(iAmThePoisoner) { interaction = "poisoner"; } else { interaction = "prey"; }
  } else {
    interaction = "";
  }
  
  return interaction;
},

computeTouchState: function(myMass) {
  this.newState = false;
  
  if(this.touchedArchons.length === 0) { return; }
  
  for(var i = 0; i < this.touchedArchons.length; i++) {
    var archonId = this.touchedArchons[i];
    var interaction = this.computeTouchInteraction(archonId, myMass);
    
    if(interaction !== "") { this.relationships[interaction].push(archonId); }
  }
  
  var currentId = null, currentRelationship = null;
  
  currentId = this.currentEngagement.hisId;
  currentRelationship = this.currentEngagement.relationship;
  
  if(currentId !== null) {
    // We are currently engaged; if our relationship with that guy
    // has changed, then we completely reset with the cutest guy on the market
    if(this.relationships[currentRelationship].indexOf(currentId) === -1) {
      currentId = null;
    }
  }

  if(currentId === null) { this.newState = true; this.setNewRelationship(); }
  
  // If we still don't have a relationship, then we're done; acutally, I don't think
  // this should happen, but I'm putting it here in case
  this.active = currentId !== null;
  
  if(this.active) {
    var c = this.currentEngagement.relationship;
    var a = Archonia.Cosmos.Dronery.getArchonById(this.currentEngagement.hisId);
    
    this.action = "stop";
    if(c === "prey") { this.tween = c; }
    else if(c === "predator") { this.headState.head.archon.goo.eat(a); }
    else if(c === "poisoned") { this.tween = c; this.headState.head.archon.goo.bePoisoned(a); }
  }
},

setNewRelationship: function() {
  this.currentEngagement.hisId = null; this.currentEngagement.relationship = "";
  
  for(var i = 0; i < this.relationshipHierarchy.length; i++) {
    var r = this.relationshipHierarchy[i];

    if(this.relationships[r].length > 0) {
      this.currentEngagement.hisId = this.relationships[r][0];
      this.currentEngagement.relationship = r;
    }
  }
},

tick: function(myMass) {
  this.computeTouchState(myMass);
  this.touchedArchons = [];

  for(var i = 0; i < this.relationshipHierarchy.length; i++) {
    var r = this.relationshipHierarchy[i];
    this.relationships[r] = [];
  }
},

touchOtherArchon: function(otherArchon) {
  if(!this.headState.tooCloselyRelated(this.headState.head.archon, otherArchon)) {
    this.touchedArchons.push(otherArchon.archoniaUniqueObjectId);
  }
}

};

})(Archonia);
