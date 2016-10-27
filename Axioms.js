/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  Archonia.Axioms.adultFatAtBirth = 100;
  Archonia.Axioms.adultFatDensity = 100;
  Archonia.Axioms.archonCount = 10;  // must be <= archon pool size
  Archonia.Axioms.archonPoolSize = 500;
  Archonia.Axioms.archoniaGooDiameter = 100;
  Archonia.Axioms.archoniaGooRadius = 50;
  Archonia.Axioms.babyFatAtBirth = 100;
  Archonia.Axioms.babyFatDensity = 1000;
  Archonia.Axioms.caloriesPerFatManna = 500;
  Archonia.Axioms.caloriesPerManna = 8;
  Archonia.Axioms.calorieLossRatioForPredation = 2;
  Archonia.Axioms.costFactorForGivingBirth = 2;
  Archonia.Axioms.costFactorForBeingBorn = 1;
  Archonia.Axioms.dailyBirthCounter = 0;
  Archonia.Axioms.dailyDeathCounter = 0;
  Archonia.Axioms.darknessAlphaHi = 0.3;
  Archonia.Axioms.darknessAlphaLo = 0.0;
  Archonia.Axioms.dayLength = 60 * 1000;  // In ms, not ticks
  Archonia.Axioms.daysPerYear = 10;
  Archonia.Axioms.embryoFatDensity = 1000;
  Archonia.Axioms.frameCount = 0;
  Archonia.Axioms.gameHeight = 600;
  Archonia.Axioms.gameWidth = 600;
  Archonia.Axioms.gameRadius = Archonia.Axioms.gameWidth / 2;
  Archonia.Axioms.goddamnedBorder = 10;
  Archonia.Axioms.goddamnedTop = Archonia.Axioms.goddamnedBorder;
  Archonia.Axioms.goddamnedRight = Archonia.Axioms.gameWidth - Archonia.Axioms.goddamnedBorder;
  Archonia.Axioms.goddamnedBottom = Archonia.Axioms.gameHeight - Archonia.Axioms.goddamnedBorder;
  Archonia.Axioms.goddamnedLeft = Archonia.Axioms.goddamnedBorder;
  Archonia.Axioms.howManyMannaMorsels = 500;  // must be <= manna pool size
  Archonia.Axioms.howManyPointsForNonSpatialInputs = 1;
  Archonia.Axioms.howManyPointsForSpatialInputs = 12;
  Archonia.Axioms.howManyPointsForTemperatureInputs = 2;
  Archonia.Axioms.mannaPoolSize = 500;
  Archonia.Axioms.maxAcceleration = 15;
  Archonia.Axioms.maxMagnitudeA = 15;
  Archonia.Axioms.maxMagnitudeV = 75;
  Archonia.Axioms.maxSpeed = 75;                   // pix/sec
  Archonia.Axioms.minimumAdultMass = 1;            // Below this, an adult will die
  Archonia.Axioms.reproductionCostFactor = 2;
  Archonia.Axioms.standardArchonTempRange = 400;
  Archonia.Axioms.standardSensorScale = 0.2;
  Archonia.Axioms.temperatureHi = 1000;
  Archonia.Axioms.temperatureLo = -1000;
  
  Archonia.Axioms.clamp = function(value, min, max) {
    value = Math.max(value, min); value = Math.min(value, max); return value;
  };

  Archonia.Axioms.computerizeAngle = function(robalizedAngle) {
    while(robalizedAngle > 2 * Math.PI) {
      robalizedAngle -= 2 * Math.PI;
    }

    var a = (robalizedAngle > Math.PI) ? 2 * Math.PI - robalizedAngle : -robalizedAngle;

    return a;
  };
  
  Archonia.Axioms.generateBellCurve = function(stopBelow, height, xOffset, widthOfRange) {
    var points = [];
    
    for(var x = xOffset, h = height; h >= stopBelow; x++) {
      h = Archonia.Axioms.getCurve(x, height, xOffset, widthOfRange);
      points.push(h);
    }
    
    var leftHand = [];
    for(var i = points.length - 1; i > 0; i--) {
      leftHand.push(points[i]);
    }

    return leftHand.concat(points);
  };
    
  Archonia.Axioms.getCurve = function(x, a, b, c) {
    var f = -Math.pow(x - b, 2);
    var g = 2 * Math.pow(c, 2);

    return a * Math.pow(Math.E, f / g);
  };
  
  Archonia.Axioms.integerInRange = function(lo, hi) {
    return Math.floor(Archonia.Axioms.realInRange(lo, hi));
  };

  Archonia.Axioms.isWithinRange = function(value, percentage, targetValue) {
    var lo = targetValue * (1 - percentage);
    var hi = targetValue * (1 + percentage);
  
    return value >= lo && value <= hi;
  };
  
  Archonia.Axioms.realInRange = function(lo, hi) {
    return Math.random() * (hi - lo) + lo;
  };

  Archonia.Axioms.robalizeAngle = function(computerizedAngle) {
    var a = (computerizedAngle < 0) ? -computerizedAngle : 2 * Math.PI - computerizedAngle;

    while(a < 2 * Math.PI) {
      a += 2 * Math.PI;
    }

    return a;
  };
  
  Archonia.Axioms.hurl = function(e) {
    var throwException = false;
    
    if(e instanceof Archonia.Essence.BirthDefect || throwException) { throw e; }
    else { console.log("Debug exception " + e.message); debugger; } // jshint ignore: line
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Axioms;
}
