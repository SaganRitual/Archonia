/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
Archonia.Form.TouchState = function(headState) {
  this.headState = headState;

  this.active = false;
  this.newState = false;
  this.tween = false;

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
  
  if(iAmThePoisoner && iAmThePoisoned) { iAmThePoisoner = false; iAmThePoisoned = false; }

  var hisMass = checkArchon.goo.getMass();
  var iAmThePredator = myMass * this.headState.genome.predationRatio > hisMass * checkArchon.genome.predationRatio;
  var iAmThePrey = myMass * this.headState.genome.predationRatio < hisMass * checkArchon.genome.predationRatio;

  // note: if the two values are equal, both bools will be false, and we'll ignore each other

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
  
  var foundSomeoneOfInterest = false;
  
  for(var i = 0; i < this.touchedArchons.length; i++) {
    var archonId = this.touchedArchons[i];
    var interaction = this.computeTouchInteraction(archonId, myMass);
    
    if(interaction !== "") { foundSomeoneOfInterest = true; this.relationships[interaction].push(archonId); }
  }

  if(!foundSomeoneOfInterest) { this.active = false; return; }
  
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

  if(currentId === null) { this.newState = true; currentId = this.setNewRelationship(); }
  
  this.active = currentId !== null;

  if(this.active) {
    var c = this.currentEngagement.relationship;
    var a = Archonia.Cosmos.Dronery.getArchonById(this.currentEngagement.hisId);
    
    this.action = "stop"; this.tween = false;
    
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
  
  return this.currentEngagement.hisId;
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
