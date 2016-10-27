/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

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

Archonia.Form.Head = function(archon) {
  this.archon = archon;
  
  this.state = new Archonia.Form.HeadState(this, archon.position);
  
  this.foodSearchAnchor = Archonia.Form.XY();
  
  this.trail = new Archonia.Form.Cbuffer(8);
};

Archonia.Form.Head.prototype = {
  
  doWeRemember: function(p) {
    var weRememberIt = false;
    
    if(!this.trail.isEmpty()) {
      this.trail.forEach(function(ix, value) {
        if(p.equals(value)) { weRememberIt = true; return false; }
      });
    }

    return weRememberIt;
  },
  
  drawFoodSearchMemory: function() {
    var drawDebugLines = false;
    
    if(drawDebugLines) {
      var p1 = Archonia.Form.XY(), p2 = Archonia.Form.XY();
    
      if(!this.trail.isEmpty()) {
        var hue = 0, lightness = 50;
        this.trail.forEach(function(ix, value) {
          var color = 'hsl(' + hue + ', 100%, ' + lightness + '%)';
          
          p1.set(value.plus(-squareSize / 2, -squareSize / 2));
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
        
          p2.set(value.plus(-squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);

          p1.set(value.plus(squareSize / 2, squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p2, p1, color);
        
          p2.set(value.plus(squareSize / 2, -squareSize / 2));
          Archonia.Essence.Dbitmap.aLine(p1, p2, color);
          
          hue += 30; lightness -= 5;
        });
      }
    }
    
  },
  
  launch: function(genome, legs, position) {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;

    this.state.launch(genome);

    this.genome = genome;
    this.legs = legs;
    this.position = position;
    this.firstTickAfterLaunch = true;
    this.knownArchons = [];
    this.headedForPrey = false;
    this.diningOnPrey = false;
    this.currentPrey = null;
    this.currentPredator = null;
    
    this.foodSearchAnchor.reset();
  
    this.trail.reset();
  },
  
  seekFood: function(where, restart) {
    var bestChoices = [], acceptableChoices = [], fallbacks = [], i = null, p = null;
    
    if(restart) { this.trail.reset(); this.foodSearchAnchor.set(this.position); }
    
    bestChoices = populateMovementChoices.call(this, where);
    
    for(i = 0; i < 8; i++) {
      if(i < bestChoices.length) {
        p = relativePositions[bestChoices[i]].plus(this.foodSearchAnchor);
      
        if(p.isInBounds()) {
          if(!this.doWeRemember(p)) { acceptableChoices.push(bestChoices[i]); }
        }
      }
      
      // If we can't find an old spot that we've forgotten, or the
      // sunburn check has returned nothing useful, we'll just take any
      // position that's in bounds
      p = relativePositions[i].plus(this.foodSearchAnchor);
      if(p.isInBounds()) { fallbacks.push(i); }
    }
    
    if(acceptableChoices.length > 0) {
      i = Archonia.Axioms.integerInRange(0, acceptableChoices.length);
      p = relativePositions[acceptableChoices[i]].plus(this.foodSearchAnchor);
    } else {
      i = Archonia.Axioms.integerInRange(0, fallbacks.length);
      p = relativePositions[fallbacks[i]].plus(this.foodSearchAnchor);
    }
  
    // This is where we're aiming; remember it so when we come back
    // into the move function, we can calculate our next move based on
    // where we intended to be, rather than where the legs might have put
    // us -- the legs don't typically get us to the specific target
    this.foodSearchAnchor.set(p);
  
    this.legs.setTargetPosition(p);
    
    this.trail.store(p);
  },
  
  move: function(where) {
    this.legs.setTargetPosition(where, 0, 0);
  },
  
  tick: function(frameCount) {
    this.frameCount = frameCount;
    
    this.state.tick(frameCount, this.archon.goo.getMass());

    var urge = this.state.getAction();
    
    switch(urge.action) {
      case "rFoodSearch": this.seekFood(urge.where, true);  break; // restart from some other state
      case "foodSearch":  this.seekFood(urge.where, false); break; // continue ongoing search
      case "encyst":      this.archon.encyst();             break;
      case "move":        this.move(urge.where);            break;
      case "stop":        this.legs.stop();                 break;
      case "waitForCommand":                                break;
    }
    
    var tween = this.state.getTween();
    if(tween === "stop") {
      this.archon.stopTween();
    } else if(tween) {
      this.archon.startTween(tween);
    }
    
    this.firstTickAfterLaunch = false;
  }
};

})(Archonia);
