/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.Range = require('./widgets/Range.js');
  Archonia.Form.XY = require('./widgets/XY.js').XY;
}

(function(Archonia) {
  Archonia.Essence.archonSizeRange = new Archonia.Form.Range(0.07, 0.125);
  Archonia.Essence.buttonHueRange = new Archonia.Form.Range(240, 0);	// Blue (240) is cold, Red (0) is hot
  Archonia.Essence.darknessRange = new Archonia.Form.Range(Archonia.Axioms.darknessAlphaHi, Archonia.Axioms.darknessAlphaLo);
  Archonia.Essence.gameCenter = Archonia.Form.XY(Archonia.Axioms.gameWidth / 2, Archonia.Axioms.gameHeight / 2);
  Archonia.Essence.oneToZeroRange = new Archonia.Form.Range(1, 0);
  Archonia.Essence.temperatureRange = new Archonia.Form.Range(Archonia.Axioms.temperatureLo, Archonia.Axioms.temperatureHi);
  Archonia.Essence.yAxisRange = new Archonia.Form.Range(Archonia.Axioms.gameHeight, 0);
  Archonia.Essence.zeroToOneRange = new Archonia.Form.Range(0, 1);
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Essence;
}