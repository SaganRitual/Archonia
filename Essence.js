/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Form.Range = require('./Minions/Range.js');
  Archonia.Form.XY = require('./Minions/XY.js').XY;
}

(function(Archonia) {
  Archonia.Essence.archonMassRange = new Archonia.Form.Range(0, 10);
  Archonia.Essence.archonTolerableTempRange = new Archonia.Form.Range(200, 1000);
  Archonia.Essence.archonSizeRange = new Archonia.Form.Range(0.07, 0.125);
  Archonia.Essence.hueRange = new Archonia.Form.Range(240, 0);	// Blue (240) is cold/small range, Red (0) is hot/large range
  Archonia.Essence.darknessRange = new Archonia.Form.Range(Archonia.Axioms.darknessAlphaHi, Archonia.Axioms.darknessAlphaLo);
  Archonia.Essence.gameCenter = Archonia.Form.XY(Archonia.Axioms.gameWidth / 2, Archonia.Axioms.gameHeight / 2);
  Archonia.Essence.oneToZeroRange = new Archonia.Form.Range(1, 0);
  Archonia.Essence.worldTemperatureRange = new Archonia.Form.Range(Archonia.Axioms.temperatureLo, Archonia.Axioms.temperatureHi);
  Archonia.Essence.yAxisRange = new Archonia.Form.Range(Archonia.Axioms.gameHeight, 0);
  Archonia.Essence.zeroToOneRange = new Archonia.Form.Range(0, 1);
  Archonia.Essence.centeredZeroRange = new Archonia.Form.Range(-1, 1);
  
  Archonia.Essence.getArchonMass = function(archonState) {
    var a = archonState.embryoCalorieBudget / Archonia.Axioms.embryoFatDensity;
    var b = archonState.adultCalorieBudget / Archonia.Axioms.adultFatDensity;
    var c = archonState.larvalCalorieBudget / Archonia.Axioms.larvalFatDensity;
    
    return a + b + c;
  };
  
  Archonia.Essence.getTempCost = function(where, archonMass, archonOptimalTemp, archonTempRange) {
    var t = Archonia.Cosmos.Sun.getTemperature(where);
    var d = Math.abs(t - archonOptimalTemp);
    var s = archonMass;
    var p = 2 * Math.log((d || 1) + 1) * Math.log(s + 1);

    // Goo wants to know the total metabolic cost of maintaining body
    // temp. Forager just wants to know what it will cost us to hang
    // out in the vicinity of nearby manna.
    var r = null;
    if(archonTempRange === undefined) { r = 0; }
    else { r = 5 * archonTempRange / Archonia.Axioms.standardArchonTempRange; }

    return p + r;
  };
  
  // This came straight from
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
  var BirthDefect = function(message) {
    this.message = message;
    var last_part = new Error().stack.match(/[^\s]+$/);
    this.stack = this.name + " at " + last_part;
  };

  BirthDefect.prototype = Object.create(Error.prototype);
  BirthDefect.prototype.name = "BirthDefect";
  BirthDefect.prototype.message = "";
  BirthDefect.prototype.constructor = BirthDefect;
  
  Archonia.Essence.BirthDefect = BirthDefect;

  Archonia.Essence.hurl = function(e) {
    var throwException = false;
    
    if(e instanceof Archonia.Essence.BirthDefect || throwException || (typeof window === "undefined")) { throw e; }
    else { console.log("Debug exception " + e.message, e.stack); debugger; } // jshint ignore: line
  };

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Essence;
}