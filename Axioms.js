/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.Range = require('./widgets/Range.js');
  Archonia.Form.XY = require('./widgets/XY.js').XY;
}

(function(Archonia) {
  Archonia.Axioms.gameHeight = 600;
  Archonia.Axioms.gameWidth = 600;
  Archonia.Axioms.gameCenter = Archonia.Form.XY(Archonia.Axioms.gameWidth / 2, Archonia.Axioms.gameHeight / 2);
  Archonia.Axioms.gameRadius = Archonia.Axioms.gameWidth / 2;

  Archonia.Axioms.archoniaGooDiameter = 100;
  Archonia.Axioms.archoniaGooRadius = 50;

  Archonia.Axioms.dayLength = 60 * 1000;  // In ms, not ticks

  Archonia.Axioms.frameCount = 0;

  Archonia.Axioms.archoniaUniqueObjectId = 0;
  
  Archonia.Axioms.temperatureHi = 1000;
  Archonia.Axioms.temperatureLo = -1000;
  Archonia.Axioms.darknessAlphaHi = 0.3;
  Archonia.Axioms.darknessAlphaLo = 0.0;
  
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
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Axioms;
}
