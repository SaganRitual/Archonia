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

  var populateMovementChoices = function(direction) {
    var chooseFrom = null;
    
    switch(direction) {
      case 3: chooseFrom = this.tempToleranceCurve3up; ix = 4; break;
      case 2: chooseFrom = this.tempToleranceCurve2up; ix = 4; break;
      case 1: chooseFrom = this.tempToleranceCurve1up; ix = 4; break;
      case 0: break;
      case -1: chooseFrom = this.tempToleranceCurve1down; ix = 0; break;
      case -2: chooseFrom = this.tempToleranceCurve3down; ix = 0; break;
      case -3: chooseFrom = this.tempToleranceCurve3down; ix = 0; break;
    }
    
    var i = null, p = null, ix = 0, theArray = [];

    for(i = 0; i < 8; i++) {
      if(chooseFrom === null) {
        theArray.push(ix);
      } else {
        p = Archonia.Axioms.integerInRange(0, 76);
      
        if(p < chooseFrom[i]) { theArray.push(ix); }
      }
      
      ix = (ix + 1) % 8;
    }
    
    // Our probabilistic attempts produced no results; send a
    // full array back so the food search can just choose from
    // any of the possible directions
    if(theArray.length === 0) { for(i = 0; i < 8; i++) { theArray.push(i); } }
    
    return theArray;
  };

Archonia.Form.Head = function(archon) {
  this.archon = archon;
  
  this.foodSearchAnchor = Archonia.Form.XY();
  this.currentFoodTarget =  Archonia.Form.XY();
  
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

  encystIf: function() {
    
    var t = this.getCardinalTemps();

    // Further down, we check whether our hunger should override our
    // temp considerations. If it does, we still want to store a
    // temp that indicates whether we're too hot or too cold. The
    // override lets us store a temp that's at the limit of our
    // tolerance. That way, if the delta gets too big, we'll
    // be ready for it, instead of waiting around for the signal buffer
    // to fill with bad temps
    var delta = null, deltaOverride = null;
    if(this.position.y < Archonia.Engine.game.centerY) {
      delta = t.bottom - this.genome.optimalTemp;
      deltaOverride = this.tempSignalScaleHi;
    } else {
      delta = t.top - this.genome.optimalTemp;
      deltaOverride = this.tempSignalScaleLo;
    }
    
    var h = this.weighEncystmentAgainstHunger(delta);
    if(h === 0) { this.temps.store(deltaOverride); }
    else { this.temps.store(delta); }

    var weWereEncysted = this.encysted;
    
    // We might have overridden the signal strength above, if we
    // determined that hunger is more important than a sunburn
    var s = this.temps.getSignalStrength();
    if(Math.abs(s) > this.genome.encystThreshold) { this.encysted = true; }
    else if(Math.abs(s) < this.genome.unencystThreshold) { this.encysted = false; }
  
    if(this.encysted) {

      if(!weWereEncysted) { this.archon.encyst(); }

    } else if(weWereEncysted) {

      this.archon.unencyst();

    }

    return this.encysted;
  },
  
  flee: function(dangerousArchonId) {
    var p = Archonia.Cosmos.Dronery.getArchonById(dangerousArchonId);
    
    // It's possible that the guy chasing us has already
    // died by the time we got here
    if(p !== null) {
      var b = this.position.getAngleFrom(p.position);
      var d = Archonia.Form.XY().setPolar(25, b);
    
      var drawDebugLines = false;
      if(drawDebugLines) { Archonia.Essence.Dbitmap.rLine(this.position, d, 'yellow'); }
    
      this.legs.setTargetPosition(d.plus(this.position), 0, 0);

      if(Archonia.Engine.game.physics.arcade.overlap(
        this.archon.sprite, p.sprite, null, null, this)) {
          this.legs.stop(); // He caught me; I'm immobilized
          this.archon.beingEaten = true;
      }
    }
  },
  
  getCardinalTemps: function() {
    // Get hot temps from my bottom and cold temps from my
    // top. This is because if we're at the top of the world,
    // the temp reading comes from out of bounds and it's
    // cold. We get trapped at the top waiting for it to
    // warm up, even in the heat of the day. Getting the low
    // temp from my top is just for aesthetic symmetry
    return {
      top: Archonia.Cosmos.Sun.getTemperature(relativePositions[0].plus(this.position)),
      bottom: Archonia.Cosmos.Sun.getTemperature(relativePositions[4].plus(this.position))
    };
  },
  
  getSunburnPlan: function() {
    var tooHot = false, tooCold = false, delta = null;
  
    var t = this.getCardinalTemps();
  
    // Get hot temps from my bottom and cold temps from my
    // top. This is because if we're at the top of the world,
    // the temp reading comes from out of bounds and it's
    // cold. We get trapped at the top waiting for it to
    // warm up, even in the heat of the day. Getting the low
    // temp from my top is just for aesthetic symmetry
    tooHot = t.bottom > this.genome.optimalTemp;
    tooCold = t.top < this.genome.optimalTemp;
    
    if(tooHot) { delta = t.bottom - this.genome.optimalTemp; }
    else { delta = t.top - this.genome.optimalTemp; }
    
    return this.getSunburnRisk(delta);
  },
  
  getSunburnRisk: function(tempDelta) {
    // M = 1 means we're within optimal limits
    // M = 2 means we're outside optimal limits
    // M = 3 means we've pegged the signal processor
    var magnitude = null;
    if(tempDelta < this.tempSignalScaleLo || tempDelta > this.tempSignalScaleHi) { magnitude = 3; }
    else if(tempDelta < this.genome.optimalTempLo || tempDelta > this.genome.optimalTempHi) { magnitude = 2; }
    else { magnitude = 1; }
    
    return Math.sign(tempDelta) * magnitude;
  },
  
  hungryEnoughForSunburn: function(tempDelta) {
    return Math.abs(tempDelta) * this.genome.tempToleranceFactor < this.archon.goo.howHungryAmI();
  },
  
  launch: function(genome, legs, position) {
    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;

    this.genome = genome;
    this.legs = legs;
    this.position = position;
    this.firstTickAfterLaunch = true;
    this.knownArchons = [];
    this.headedForPrey = false;
    this.diningOnPrey = false;
    this.currentPrey = null;
    this.currentPredator = null;
    
    this.whenToIssueNextMoveOrder = 0;
  
    this.foodSearchAnchor.reset();
    this.currentFoodTarget.reset();
  
    this.trail.reset();

    this.encysted = false;

    this.howLongBetweenMoves = 2 * this.genome.maxMVelocity;
    
    this.tempSignalScaleLo = this.genome.optimalTempLo - this.genome.tempRadius;
    this.tempSignalScaleHi = this.genome.optimalTempHi + this.genome.tempRadius;

    this.temps = new Archonia.Form.SignalSmoother(
      Math.floor(this.genome.tempSignalBufferSize), this.genome.tempSignalDecayRate,
      this.tempSignalScaleLo, this.tempSignalScaleHi
    );
    
    // What we're doing here: creating a bell curve to weight the choice
    // the archon will make about whether to go outside its temperature
    // comfort zone. We generate a curve with the specified width, then
    // find the middle 7 entries in the array. We then use the values of
    // those entries to generate another array with subscripts into the
    // relativePositions array.
    //
    // Example:
    // 
    // Bell curve looks like 1, 2, 3, 4, 3, 2, 1
    // (and we add one at the beginning that's equal to the one already
    // at the beginning)
    //
    // We generate an array like this for the top direction, which means
    // we want to avoid the bottom, at index 4 in the relative positions
    // array:
    // [ 4, 5, 6, 6, 7, 7, 7, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3 ]
    // so we'll be most likely to choose direction 0 when we take a
    // random index into the above array
    // 
    // Similarly, like this for the bottom direction, which means we want
    // to avoid the top, which starts at index 0 in the relative positions
    // array:
    // [ 0, 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 6, 6, 7 ]
    //
    // Note that in both cases, we're using the value at the beginning of
    // the bell curve as the value for the direction that points directly
    // opposite the direction we want to go
    var setupTempToleranceCurve = function(curveName, width) {
      if(width < 1 || width > 10) { throw new Archonia.Essence.BirthDefect("Temp tolerance curve out of bounds"); }
      var stopBelow = 0.01, height = 0.75, xOffset = 0;
      
      this[curveName + "up"] = new Array(8);
      this[curveName + "down"] = new Array(8);
      
      for(var i = width; i < 10; i += 0.01) {
        
        var curve = Archonia.Axioms.generateBellCurve(stopBelow, height, xOffset, width);

        var middle = Math.floor(curve.length / 2);
  
        // We need a curve that gives us > 0 at the ends
        if(curve[middle - 3].toFixed(2) > 0) {
          var ixUp = 0, ixDown = 4;

          for(var j = middle - 3; j <= middle + 3; j++) {
            // ixUp === 0 also means ixDown === 4
            if(ixUp === 0) {
              this[curveName + "up"][ixUp] = Math.floor(curve[j] * 100);
              this[curveName + "down"][ixDown] = Math.floor(curve[j] * 100);
            }
            
            ixUp = (ixUp + 1) % 8; ixDown = (ixDown + 1) % 8;
  
            this[curveName + "up"][ixUp] = Math.floor(curve[j] * 100);
            this[curveName + "down"][ixDown] = Math.floor(curve[j] * 100);
          }
          
          break;
        }
      }
    };
    
    // Genes decide how important it is to go outside your temperature
    // comfort zone, the idea being that it might be useful to do so
    // in order to look for food
    setupTempToleranceCurve.call(this, 'tempToleranceCurve1', this.genome.tempTolerance1CurveWidth);
    setupTempToleranceCurve.call(this, 'tempToleranceCurve2', this.genome.tempTolerance2CurveWidth);
    setupTempToleranceCurve.call(this, 'tempToleranceCurve3', this.genome.tempTolerance3CurveWidth);
  },
  
  prey: function(tastyArchonId) {
    var a = Archonia.Cosmos.Dronery.getArchonById(tastyArchonId);
    
    var drawDebugLines = false;
    if(a !== null && drawDebugLines) { Archonia.Essence.Dbitmap.aLine(this.position, a.position, 'red'); }
    
    if(a === null || tastyArchonId !== this.currentPrey) {
      this.diningOnPrey = false; this.headedForPrey = false; this.currentPrey = tastyArchonId;
    }
    
    if(a !== null) {  // They often die while being eaten
      if(this.diningOnPrey) {
        this.archon.goo.eat(a);
      } else {
        if(Archonia.Engine.game.physics.arcade.overlap(
          this.archon.sprite, a.sprite, null, null, this)) {
          this.legs.stop();
          this.diningOnPrey = true;
        } else {
          if(!this.headedForPrey) {
            this.headedForPrey = true;
            this.legs.setTargetPosition(a.position, 0, 0);
          }
        }
      }
    }
  },
  
  seekFood: function(restart) {
    var bestChoices = [], acceptableChoices = [], fallbacks = [], h = null, i = null, p = null;
    
    if(restart) { this.trail.reset(); this.foodSearchAnchor.set(this.position); }
    
    h = this.getSunburnPlan();
    bestChoices = populateMovementChoices.call(this, h);
    
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
  
  standardMove: function(foodTarget) {
    var weWereEncysted = this.encysted;
    var foodIsInSight = !foodTarget.equals(0);
    var weWereEating = !this.currentFoodTarget.equals(0);

    if(!foodIsInSight) { this.currentFoodTarget.set(0); }
    
    if(!this.encysted && foodIsInSight) {
      if(!this.currentFoodTarget.equals(foodTarget)) {
        this.currentFoodTarget.set(foodTarget);
        this.legs.setTargetPosition(this.currentFoodTarget, 0, 0);
      }

      var drawDebugLines = false;
      if(drawDebugLines) {
        Archonia.Essence.Dbitmap.aLine(this.position, foodTarget, 'red');
      }
    }
    
    if((weWereEating && !foodIsInSight) || this.frameCount > this.whenToIssueNextMoveOrder) {
      var encysted = this.encystIf();
      
      if(!encysted && !foodIsInSight) {
        var restartFoodSearch = weWereEncysted || weWereEating || this.firstTickAfterLaunch;
        this.seekFood(restartFoodSearch);
      }

      this.whenToIssueNextMoveOrder = this.frameCount + this.howLongBetweenMoves;
    }

    // Do this at the end, after the food search has had a
    // chance to reset its trail, so I don't see a flicker --
    // I think, at least, that I'd see a flicker if we saw
    // that there is no food in sight but had not let the
    // seeker reset the trail
    if(!foodIsInSight) { this.drawFoodSearchMemory(); }

  },
  
  tick: function(frameCount, foodTarget, dangerousArchonId, tastyArchonId) {
    this.frameCount = frameCount;
    
    if(dangerousArchonId === null && tastyArchonId === null) {
      this.standardMove(foodTarget);
    } else if(dangerousArchonId !== null) {
      this.flee(dangerousArchonId);
    } else {
      this.prey(tastyArchonId);
    }
    
    this.firstTickAfterLaunch = false;
  },
  
  weighEncystmentAgainstHunger: function(tempDelta) {
    if(tempDelta === null) {
      return 0;
    } else if(this.hungryEnoughForSunburn(tempDelta)) {
      // If my genes tell me my current hunger level is higher than
      // my need for good weather, then get out there and find some 
      return 0;
    } else {
      return Math.sign(tempDelta);
    }
  }
};

})(Archonia);
