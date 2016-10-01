/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
  A.Coblet = require('./Coblet.js');
}

(function(A) {

A.Cobber = function(archon) {
  console.log(archon);
  this.archon = archon;
  this.currentAction = 'encapsulate';
  
  this.cobs = {}; var gcobs = archon.genome.cobs, pcobs = this.cobs;
  
  for(var gc in gcobs) {
    pcobs[gc] = {};
    var gcob = gcobs[gc], pcob = pcobs[gc];
    
    for(var gg in gcob) { var gene = gcob[gg]; pcob[gg] = gene; }
  }
  
  var geneSet = gcobs.temperature, howManyPoints = 2;
  
  pcobs.temperature.coblet = new A.Coblet(howManyPoints, this.gatherTemps, geneSet.valuesRangeLo, geneSet.valuesRangeHi, geneSet.decayRate);
  pcobs.temperature.points = Array(howManyPoints).fill(0);
};

A.Cobber.prototype = {
  currentAction: null,
  
  chooseAction: function() {
    var tempSignal_ = null, tempSignal = null;
    
    if(!this.cobs.temperature.coblet.isEmpty) {
      this.cobs.temperature.coblet.getBestSignal(1);
      tempSignal = tempSignal_.weight * this.pcobs.temperature.multiplier;
    
      if(tempSignal > this.inertiaThreshold) {
        this.currentAction = 'move'; return { action: this.currentAction, direction: tempSignal.direction };
      }
    }

    return this.currentAction;
  },
  
  gatherTemps: function() {
    var measurements = [];
    for(var i = 0; i < this.pcobs.temperature.points.length; i++) { measurements.push(this.pcobs.temperature.points[i]); }
    return measurements;
  },
  
  launch: function() {
    
  },
  
  senseArchon: function(/*who*/) {
    
  },
  
  senseFood: function(/*what*/) {
    
  },
  
  senseTemp: function(temp, where) {
    this.pcobs.temperature.points[where] = temp;
  },
  
  tick: function() {
    
  }
};
  
})(A);

if(typeof window === "undefined") {
  module.exports = A.Cobber;
}
