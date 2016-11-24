/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var howManyTicksBetweenMoves_ = 60;
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
        if(searchParameters === "randomUpOnly") { if(i === 7 || i === 0 || i === 1) { theArray.push(i); } }
        else if(searchParameters === "randomDownOnly") { if(i === 3 || i === 4 || i === 5) { theArray.push(i); } }
      }
    }
    
    return theArray;
  };

var Antwalk = function(archon, howManyTicksBetweenMoves) {
  if(howManyTicksBetweenMoves === undefined) { howManyTicksBetweenMoves = howManyTicksBetweenMoves_; }
  
  this.state = archon.state;
  this.legs = archon.legs;
  
  this.howManyTicksBetweenMoves = howManyTicksBetweenMoves;
  
  this.searchAnchor = Archonia.Form.XY();
  this.debugRandomTarget = Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
};

Antwalk.prototype = {
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }

    return weRememberIt;
  },
  
  drawAntwalk: function(constraints) {
    var drawDebugLines = false;

    if(drawDebugLines && !this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        Archonia.Engine.Debug.cSquare(value, squareSize, "yellow", 2);
      });
    }

    var drawDirectionLine = false;

    if(drawDirectionLine && !this.trail.isEmpty()) {
      var ix = this.trail.getIndexOfNewestElement();
      var p = this.trail.getElementAt(ix);
      var color = null;
      switch(constraints) {
        case "random": color = "green"; break;
        case "randomUpOnly": color = "blue"; break;
        case "randomDownOnly": color = "red"; break;
      }
      
      Archonia.Engine.Debug.aLine(this.state.position, p, color, 2);
      Archonia.Engine.Debug.aLine(this.state.position, this.debugRandomTarget, "black", 1);
    }
  },
  
  launchToNextPosition: function(where) {
    var bestChoices = [], acceptableChoices = [], fallbacks = [];
    var i = null, p = null, r = null;
    
    bestChoices = populateMovementChoices.call(this, where);
    
    for(i = 0; i < bestChoices.length; i++) {
      p = relativePositions[bestChoices[i]].plus(this.searchAnchor);
    
      if(p.isInBounds()) {
        if(this.doWeRemember(p)) { fallbacks.push(bestChoices[i]); }
        else { acceptableChoices.push(bestChoices[i]); }
      }
    }
    
    // If we're in up-only or down-only mode, we need to allow
    // for horizontal movement, in case we're crammed against
    // the top or bottom of the world
    fallbacks.push(2); fallbacks.push(6);
    
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

    // Just to make the movement more interesting, especially when
    // we're smashed up against the ceiling or floor
    r = p.randomizedTo(squareSize); if(!r.isInBounds()) { r.set(p); }

    this.debugRandomTarget.set(r);
    this.legs.setTargetPosition(r);
  },
  
  launch: function() {
    this.active = false;
    this.firstMoveAfterForagingRestart = false;
    this.searchAnchor.reset();
    this.trail.reset();
  },
  
  tick: function(walk, constraints) {
    if(!walk) { this.active = false; return; }

    if(!this.active) {
      this.trail.reset();
      this.active = true;
      this.firstMoveAfterForagingRestart = true;

      if(this.state.firstTickAfterLaunch) {
        this.whenToIssueNextMove = 0;
      } else {
        this.whenToIssueNextMove = this.state.frameCount + this.howManyTicksBetweenMoves / 2;
        this.legs.stop();
      }
    }

    if(this.state.frameCount > this.whenToIssueNextMove) {
      if(this.firstMoveAfterForagingRestart) {
        this.searchAnchor.set(this.state.position);
        this.firstMoveAfterForagingRestart = false;
      }

      Archonia.Essence.renderSchedule = [ ];
      this.launchToNextPosition(constraints);
      this.whenToIssueNextMove = this.state.frameCount + this.howManyTicksBetweenMoves;
    }

    this.drawAntwalk(constraints);
  }
};

Archonia.Form.Antwalk = Antwalk;

})(Archonia);
