/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var yAxisRange = null;
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
        if(searchParameters === "randomUpOnly") { if(i === 7 || i === 0 || i === 1) { theArray.push(i); } }
        else if(searchParameters === "randomDownOnly") { if(i === 3 || i === 4 || i === 5) { theArray.push(i); } }
      }
    }
    
    return theArray;
  };

Archonia.Form.Forager = function(archon) {
  this.genome = archon.genome;
  this.state = archon.state;
  
  this.searchAnchor = Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
  
  if(yAxisRange === null) {
    yAxisRange = new Archonia.Form.Range(
      Archonia.Engine.game.world.centerY - Archonia.Axioms.gameRadius,
      Archonia.Engine.game.world.centerY + Archonia.Axioms.gameRadius
    );
  }
};

Archonia.Form.Forager.prototype = {
  computeFoodSearchState: function(tempSignal, hungerSignal) {
    var netTemp = Math.abs(tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.genome.hungerToleranceMultiplier;
    
    if(netTemp > netHunger) {
      // If temp wins, then we just go in the direction that gets us
      // closer to a temp signal of zero
      if(tempSignal > 0) { this.where = "randomDownOnly"; } else { this.where = "randomUpOnly"; }
      
    } else {
      var currentTemp = Archonia.Cosmos.TheAtmosphere.getTemperature(this.state.position);
      var scaledTemp = Archonia.Essence.centeredZeroRange.convertPoint(currentTemp, Archonia.Essence.worldTemperatureRange);
      var scaledY = Archonia.Essence.centeredZeroRange.convertPoint(this.state.position.y, yAxisRange);
      
      var upOk = true, downOk = true, stayCloseToManna = 1.25;
      
      if( // Hunger wins over temp threshold; here we're just trying to stay within manna growth range
        scaledTemp !== 0 && Math.sign(scaledTemp) !== Math.sign(scaledY) &&
        Math.abs(scaledTemp / scaledY) > stayCloseToManna
      ) { if(scaledTemp > 0) { upOk = false; } else { downOk = false; } }

      if(upOk && downOk) { this.where = "random"; }
      else if(upOk)      { this.where = "randomUpOnly"; }
      else               { this.where = "randomDownOnly"; }
    }
  },
  
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

    if(drawDebugLines && !this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        Archonia.Essence.Dbitmap.cSquare(value, squareSize, "yellow", 2);
      });
    }

    var drawDirectionLine = false;

    if(drawDirectionLine && !this.trail.isEmpty()) {
      var ix = this.trail.getIndexOfNewestElement();
      var p = this.trail.getElementAt(ix);
      var color = null;
      switch(this.where) {
        case "random": color = "green"; break;
        case "randomUpOnly": color = "blue"; break;
        case "randomDownOnly": color = "red"; break;
      }
      
      Archonia.Essence.Dbitmap.aLine(this.state.position, p, color, 2);
    }
  },
  
  forage: function(where) {
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
    
    this.state.targetPosition.set(r);
  },
  
  launch: function() {
    this.foraging = false;
    this.firstMoveAfterForagingRestart = false;
    this.searchAnchor.reset();
    this.trail.reset();
    this.currentMannaTarget = null;
    this.where = "random";
  },
  
  tick: function() {
    if(this.state.sensedManna.length > 0) {
      this.foraging = false;

      var ix = this.state.sensedManna.findIndex(
        function(m) { return m.archoniaUniqueObjectId === this.currentMannaTarget; }, this
      );
      
      if(ix === -1) {
        var archonMass = Archonia.Essence.getArchonMass(this.state);
        var optimalTemp = this.genome.optimalTemp;
        var p = this.state.position;
        
        this.state.sensedManna.sort(function(a, b) {

          var aTempCost = Archonia.Essence.getTempCost(a, archonMass, optimalTemp);
          var bTempCost = Archonia.Essence.getTempCost(b, archonMass, optimalTemp);
          
          if(aTempCost === bTempCost) {
            return p.getDistanceTo(a) < p.getDistanceTo(b);
          } else {
            return aTempCost < bTempCost;
          }

        });
        
        ix = 0;
      }
      
      var bestManna = this.state.sensedManna[ix];
      this.currentMannaTarget = bestManna.archoniaUniqueObjectId;
      this.state.targetPosition.set(bestManna, 0, 0);

    } else {

      if(!this.foraging) {
        this.trail.reset();
        this.foraging = true;
        this.firstMoveAfterForagingRestart = true;

        if(this.state.firstTickAfterLaunch) {
          this.whenToIssueNextMove = 0;
        } else {
          this.whenToIssueNextMove = this.state.frameCount + howManyTicksBetweenMoves / 2;
          this.state.targetPosition.set(0);
        }
      }

      if(this.state.frameCount > this.whenToIssueNextMove) {
        if(this.firstMoveAfterForagingRestart) {
          this.searchAnchor.set(this.state.position);
          this.firstMoveAfterForagingRestart = false;
        }

        var tempSignal = this.state.tempInput.getSignalStrength();
        var hungerSignal = this.state.hungerInput.getSignalStrength();
        this.computeFoodSearchState(tempSignal, hungerSignal);

        this.forage(this.where);
        this.whenToIssueNextMove = this.state.frameCount + howManyTicksBetweenMoves;
      }

      this.drawForagingMemory();
    }
  }
};

})(Archonia);
