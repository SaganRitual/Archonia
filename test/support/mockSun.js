/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  Archonia.Cosmos.Sun = {
    getStrength: function() {
      if(process.env['Sun.getStrength'] === undefined) { process.env['Sun.getStrength'] = 1; }
      return process.env['Sun.getStrength'];
    },
    
    getTemperature: function(where, whereY) {
      if(process.env['Sun.getTemperature'] === undefined) { process.env['Sun.getTemperature'] = 0; }
      return process.env['Sun.getTemperature'];
    },
    
    ignite: function() { }
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Sun;
}
