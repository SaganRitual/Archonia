var Archotype = Archotype || {};
var Axioms = Axioms || {};

if(typeof window === "undefined") {
  Archotype.Range = require('./widgets/Range.js');
  Archotype.XY = require('./widgets/XY.js').XY;
}

(function(Axioms) {
  Axioms.gameHeight = 600;
  Axioms.gameWidth = 600;
  Axioms.gameCenter = Archotype.XY(Axioms.gameWidth / 2, Axioms.gameHeight / 2);
  Axioms.gameRadius = Axioms.gameWidth / 2;

  Axioms.archoniaGooDiameter = 100;
  Axioms.archoniaGooRadius = 50;

  Axioms.dayLength = 60 * 1000;  // In ms, not ticks

  Axioms.frameCount = 0;

  Axioms.archoniaUniqueObjectId = 0;
  
  Axioms.temperatureHi = 1000;
  Axioms.temperatureLo = -1000;
  Axioms.darknessAlphaHi = 0.3;
  Axioms.darknessAlphaLo = 0.0;

  Axioms.ag = null;

	Axioms.buttonHueRange = new Archotype.Range(240, 0);	// Blue (240) is cold, Red (0) is hot
  Axioms.darknessRange = new Archotype.Range(Axioms.darknessAlphaHi, Axioms.darknessAlphaLo);
  Axioms.oneToZeroRange = new Archotype.Range(1, 0);
  Axioms.temperatureRange = new Archotype.Range(Axioms.temperatureLo, Axioms.temperatureHi);
  Axioms.yAxisRange = new Archotype.Range(Axioms.gameHeight, 0);
  Axioms.zeroToOneRange = new Archotype.Range(0, 1);

  
  Axioms.clamp = function(value, min, max) {
    value = Math.max(value, min); value = Math.min(value, max); return value;
  };

  Axioms.computerizeAngle = function(robalizedAngle) {
    while(robalizedAngle > 2 * Math.PI) {
      robalizedAngle -= 2 * Math.PI;
    }

    var a = (robalizedAngle > Math.PI) ? 2 * Math.PI - robalizedAngle : -robalizedAngle;

    return a;
  };
  
  Axioms.generateBellCurve = function(stopBelow, height, xOffset, widthOfRange) {
    var points = [];
    
    for(var x = xOffset, h = height; h >= stopBelow; x++) {
      h = Axioms.getCurve(x, height, xOffset, widthOfRange);
      points.push(h);
    }
    
    var leftHand = [];
    for(var i = points.length - 1; i > 0; i--) {
      leftHand.push(points[i]);
    }

    return leftHand.concat(points);
  };
    
  Axioms.getCurve = function(x, a, b, c) {
    var f = -Math.pow(x - b, 2);
    var g = 2 * Math.pow(c, 2);

    return a * Math.pow(Math.E, f / g);
  };
  
  Axioms.integerInRange = function(lo, hi) {
    return Math.floor(Axioms.realInRange(lo, hi));
  };
  
  Axioms.realInRange = function(lo, hi) {
    return Math.random() * (hi - lo) + lo;
  };

  Axioms.robalizeAngle = function(computerizedAngle) {
    var a = (computerizedAngle < 0) ? -computerizedAngle : 2 * Math.PI - computerizedAngle;

    while(a < 2 * Math.PI) {
      a += 2 * Math.PI;
    }

    return a;
  };
})(Axioms);

if(typeof window == "undefined") {
  module.exports = Axioms;
}
