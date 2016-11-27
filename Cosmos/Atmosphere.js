/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Atmosphere = function() {
  
};

Atmosphere.prototype = {
  getTemperature: function(/*where*/) {
    var sunEnergyLevel = Archonia.Cosmos.TheSun.getEnergyLevel();
    
    return sunEnergyLevel;
  }
};

Archonia.Cosmos.TheAtmosphere = { breathe: function() { Archonia.Cosmos.TheAtmosphere = new Atmosphere(); } };

})(Archonia);
