/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var howManyTicksBetweenMoves = 60;
  var squareSize = 30;
  var relativePositions = [
    Archonia.Form.XY(0, -squareSize), Archonia.Form.XY(squareSize, -squareSize), Archonia.Form.XY(squareSize, 0),
    Archonia.Form.XY(squareSize, squareSize), Archonia.Form.XY(0, squareSize), Archonia.Form.XY(-squareSize, squareSize),
    Archonia.Form.XY(-squareSize, 0), Archonia.Form.XY(-squareSize, -squareSize)
  ];

  var populateMovementChoices = function(searchParameters) {
    var theArray = [];
    
    for(var i = 0; i < 8; i++) {
      if(searchParameters === "random") { theArray.push(i); }
      else {
        switch(searchParameters) {
          case "randomNoDown": if(i === 2 || i === 6) { theArray.push(i); } // jshint ignore: line
          case "randomUpOnly": if(i === 7 || i === 0 || i === 1) { theArray.push(i); }  break;
        }
      
        switch(searchParameters) {
          case "randomNoUp": if(i === 2 || i === 6) { theArray.push(i); } // jshint ignore: line
          case "randomDownOnly": if(i === 3 || i === 4 || i === 5) { theArray.push(i); } break;
        }
      }
    }
    
    return theArray;
  };

Archonia.Form.Forager = function(archon) {
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "head");
  this.state = Archonia.Cosmos.Statery.makeStateneCluster(archon, "head");
  
  this.legs = archon.legs;
  
  this.searchAnchor = Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
};

Archonia.Form.Forager.prototype = {
  
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }

    return weRememberIt;
  },
  
  drawForagingMemory: function() {
    var drawDebugLines = false;
    
    if(drawDebugLines) {
      if(!this.trail.isEmpty()) {
        this.trail.forEach(function(ix, value) {
          Archonia.Essence.Dbitmap.cSquare(value, squareSize * 0.75, "yellow", 2);
        });
      }
    }
  },
  
  forage: function(where) {
    var bestChoices = [], acceptableChoices = [], fallbacks = [], i = null, p = null;
    
    bestChoices = populateMovementChoices.call(this, where);
    
    for(i = 0; i < 8; i++) {
      if(i < bestChoices.length) {
        p = relativePositions[bestChoices[i]].plus(this.searchAnchor);
      
        if(p.isInBounds()) {
          if(!this.doWeRemember(p)) { acceptableChoices.push(bestChoices[i]); }
        }
      }
      
      // If we can't find an old spot that we've forgotten just take any
      // position that's in bounds
      p = relativePositions[i].plus(this.searchAnchor);
      if(p.isInBounds()) { fallbacks.push(i); }
    }
    
    if(acceptableChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, acceptableChoices.length);
      p = relativePositions[acceptableChoices[i]].plus(this.searchAnchor);
    } else {
      i = Archonia.Axioms.integerInRange(0, fallbacks.length);
      p = relativePositions[fallbacks[i]].plus(this.searchAnchor);
    }
  
    // This is where we're aiming; remember it so when we come back
    // into the move function, we can calculate our next move based on
    // where we intended to be, rather than where the legs might have put
    // us -- the legs don't typically get us to the specific target
    this.searchAnchor.set(p);
    this.trail.store(p);
    this.legs.setTargetPosition(p);
  },
  
  launch: function() {
    this.active = false;
    this.searchAnchor.reset();
    this.trail.reset();
    this.currentMannaTarget = null;
  },
  
  tick: function() {
    if(this.state.sensedSkinnyManna.length > 0) {

      this.foraging = false;

      var ix = this.state.sensedSkinnyManna.findIndex(
        function(m) { return m.archoniaUniqueObjectId === this.currentMannaTarget; }, this
      );
      
      if(ix === -1) {
        var p = this.state.position;
        this.state.sensedSkinnyManna.sort(function(a, b) { return p.getDistanceTo(a) < p.getDistanceTo(b); });
        
        ix = 0;
      }
      
      this.currentMannaTarget = this.state.sensedSkinnyManna[ix].archoniaUniqueObjectId;
      this.legs.setTargetPosition(this.state.sensedSkinnyManna[ix], 0, 0);
      
    } else {
      if(!this.foraging) {
        this.trail.reset();
        this.searchAnchor.set(this.state.position);
        this.whenToIssueNextMove = 0;
        this.foraging = true;
      }

      if(this.state.frameCount > this.whenToIssueNextMove) {
        this.forage("random");
        this.whenToIssueNextMove = this.state.frameCount + howManyTicksBetweenMoves;
      }

      this.drawForagingMemory();
    }
  }
};

})(Archonia);
