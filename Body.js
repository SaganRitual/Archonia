/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
}

(function(A) {

A.Body = function(/*archon*/) {
};

})(A);

if(typeof window === "undefined") {
  module.exports = A.Body;
}
