/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  Archonia.Cosmos.Archonery = { momentOfCreation: true };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Archonery;
}
