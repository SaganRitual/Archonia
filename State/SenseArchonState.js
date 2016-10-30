/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var otherGuySort = function(a, b) {
  var aArchon = Archonia.Cosmos.Dronery.getArchonById(a);
  var bArchon = Archonia.Cosmos.Dronery.getArchonById(b);
  
  // Really should look into this
  if(aArchon === null && bArchon !== null) { return -1; }
  if(bArchon === null && aArchon !== null) { return 1; }
  if(aArchon === null && bArchon === null) { return 0; }

  var aDistance = this.headState.head.archon.position.getDistanceTo(aArchon.position);
  var bDistance = this.headState.head.archon.position.getDistanceTo(bArchon.position);

  return aDistance < bDistance;
};
  
Archonia.Form.SenseArchonState = function(headState) {
  this.headState = headState;

  this.active = false;
  this.newState = false;
  this.where = Archonia.Form.XY();

  this.sensedArchons = [];

  this.relationshipHierarchy = [ "evade", "pursue" ];
  
  this.currentEngagement = { hisId: null, relationship: "" };
  this.relationships = { evade: [], pursue: [] };
};

Archonia.Form.SenseArchonState.prototype = {

  computeSenseInteraction: function(checkArchonId, myMass) {
    var checkArchon = Archonia.Cosmos.Dronery.getArchonById(checkArchonId);
  
    if(checkArchon === null) { return ""; } // Sometimes they die before we can check them
  
    var hisMass = checkArchon.goo.getMass();
    var iAmThePursuer = myMass * this.headState.genome.predationRatio > hisMass;
    var iAmTheEvader = hisMass * this.headState.genome.predatorFearRatio > myMass;

    var interaction = null;
    if(iAmThePursuer) { interaction = "pursue"; }
    else if(iAmTheEvader) { interaction = "evade"; }
    else { interaction = ""; }
  
    return interaction;
  },

  computeSenseState: function(myMass) {
    var _this = this;
    
    if(this.sensedArchons.length === 0) { this.active = false; return; }
    
    for(var i = 0; i < this.sensedArchons.length; i++) {
      var archonId = this.sensedArchons[i];
      var interaction = this.computeSenseInteraction(archonId, myMass);
    
      if(interaction !== "") { this.relationships[interaction].push(archonId); }
    }

    var currentId = null, currentRelationship = null;
    
    if(this.relationships.evade.length > 0) {
      this.relationships.evade.sort(function(a, b) { otherGuySort.call(_this, a, b); });
      
      currentId = this.relationships.evade[0];
      currentRelationship = "evade";
      
    } else {
      currentId = this.currentEngagement.hisId;

      if(currentId === null) {
        // We are currently engaged; if that guy has disappeared from our
        // radar, go after the closest one
        if(this.relationships.pursue.indexOf(currentId) === -1) {
          this.relationships.pursue.sort(function(a, b) { otherGuySort.call(_this, a, b); });
          currentId = this.relationships.pursue[0];
        }
      }
    }

    if(currentId === null) { Archonia.Axioms.hurl(new Error("This shouldn't happen")); }
    else {
      this.active = true; this.newState = true;
      this.action = "move";
      
      var theOtherGuy = Archonia.Cosmos.Dronery.getArchonById(currentId);
      
      if(theOtherGuy !== null) {  // are we sure it's ok that Dronery sometimes says null?
        if(this.currentEngagement.relationship === "evade") {
          var a = this.position.getAngleFrom(theOtherGuy.position);

          this.where.setPolar(25, a).plus(this.position); this.where.floor();
        } else {
          this.where.set(theOtherGuy.position);
        }
      }
    }
  },

  senseOtherArchon: function(otherArchon) {
    if(!this.headState.tooCloselyRelated(this.headState.head.archon, otherArchon)) {
      this.sensedArchons.push(otherArchon.archoniaUniqueObjectId);
    }
  },
  
  tick: function(myMass) {
    this.computeSenseState(myMass);

    this.sensedArchons = [];
    this.relationships.pursue = [];
    this.relationships.evade = [];
  }
  
};
  
})(Archonia);
