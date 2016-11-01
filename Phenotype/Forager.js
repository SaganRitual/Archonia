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
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "forager");
  this.state = Archonia.Cosmos.Statery.makeStateneCluster(archon, "forager");
  
  this.searchAnchor = Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
  
  if(yAxisRange === null) {
    yAxisRange = new Archonia.Form.Range(
      Archonia.Engine.game.world.centerY + Archonia.Axioms.gameRadius,
      Archonia.Engine.game.world.centerY - Archonia.Axioms.gameRadius
    );
  }
};

Archonia.Form.Forager.prototype = {
  computeFoodSearchState: function(tempSignal, hungerSignal) {
    var ySignal = Archonia.Essence.centeredZeroRange.convertPoint(this.state.position.y, yAxisRange);
    
    var netTemp = Math.abs(tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.genome.hungerToleranceMultiplier;
    
    if(this.state.archonUniqueId === 0) {
      Archonia.Essence.Logger.log(
        tempSignal.toFixed(2), hungerSignal.toFixed(2), ySignal.toFixed(2),
        netTemp.toFixed(2), netHunger.toFixed(2), this.state.position.toString()
      );
    }
    
    if(netTemp > netHunger) {
      // If temp wins, then we just go in the direction that gets us
      // closer to a temp signal of zero
      if(tempSignal > 0) { this.where = "randomDownOnly"; } else { this.where = "randomUpOnly"; }
      
    } else {
      // Note: when we compare the tempSignal to the ySignal, but that doesn't
      // really work in principle. The temp signal is about our own health; what
      // I'm trying to do here is get us to go to where the manna is most
      // likely to be. Won't work if our own temp signal doesn't correspond to
      // the way the manna grows. Also I think it defeats the whole fat manna thing.
      // Come back to this when not trying to fix a hundred other things
      var upOk = true, downOk = true;
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal >= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal <= 0 && tempSignal > 0) { upOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal <= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal >= 0 && tempSignal > 0) { upOk = false; }

      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal >= 0 && tempSignal < 0) { upOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal <= 0 && tempSignal > 0) { downOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal <= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal >= 0 && tempSignal > 0) { upOk = false; }
      
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
        Archonia.Essence.Dbitmap.cSquare(value, squareSize * 0.75, "yellow", 2);
      });
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
    this.state.targetPosition.set(p);
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
      this.state.targetPosition.set(this.state.sensedSkinnyManna[ix], 0, 0);
      
    } else {
      if(!this.foraging) {
        this.trail.reset();
        this.searchAnchor.set(this.state.position);
        this.whenToIssueNextMove = 0;
        this.foraging = true;
      }

      if(this.state.frameCount > this.whenToIssueNextMove) {
        var tempSignal = this.state.tempInput.getSignalStrength();
        var hungerSignal = this.state.hungerInput.getSignalStrength();
        this.computeFoodSearchState(tempSignal, hungerSignal);

        this.forage("random");
        this.whenToIssueNextMove = this.state.frameCount + howManyTicksBetweenMoves;
      }

      this.drawForagingMemory();
    }
  }
};

})(Archonia);
