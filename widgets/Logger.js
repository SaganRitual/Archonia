/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.Cbuffer = require('./Cbuffer.js');
}

(function(Archonia) {
  
var messages = null;
var testOutput = null;
  
var initialize_ = function(size, testOutput_) {
  messages = new Archonia.Form.Cbuffer(1000);
  testOutput = testOutput_;
};
  
var log_ = function(message) {
  messages.store(message);
};

var show_ = function(howFarBack) {
  var ix = null;
  
  ix = messages.getIndexOfNewestElement();
  ix = messages.add(ix, -(howFarBack - 1));
  
  for(var i = 0; i < howFarBack; i++) {
    var output = i + " (" + ix + "): " + messages.getElementAt(ix);
    
    if(testOutput === undefined) { console.log(output); }
    else { testOutput.push(output); }
    
    ix = messages.add(ix, 1);
  }
};
  
Archonia.Essence.Logger = {
  initialize: function(size, testOutput) { initialize_(size, testOutput); },
  log: function(message) { log_(message); },
  show: function(howFarBack) { show_(howFarBack); }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Essence.Logger;
}
