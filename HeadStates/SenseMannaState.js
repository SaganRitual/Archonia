/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var mannaIndexFind = function(manna) {
  return this.currentTarget.equals(manna);
};
  
Archonia.Form.SenseMannaState = function(headState) {
  this.headState = headState;

  this.active = false;
  this.newState = false;
  this.where = Archonia.Form.XY();

  this.sensedManna = [];
  
  this.currentTarget = Archonia.Form.XY();
};

Archonia.Form.SenseMannaState.prototype = {

  computeSenseState: function() {
    if(this.sensedManna.length === 0) { this.active = false; }
    else {
      if(this.sensedManna.findIndex(mannaIndexFind, this) === -1) {
        
        var _this = this;
        this.sensedManna.sort(function(a, b) {
          var aDistance = _this.headState.head.archon.position.getDistanceTo(a);
          var bDistance = _this.headState.head.archon.position.getDistanceTo(b);

          return aDistance < bDistance;
        });

        this.currentTarget.set(this.sensedManna[0]);
      }
    
      this.active = true;
      this.newState = true;
      this.action = "move";
      this.where.set(this.currentTarget);
    }
  },
  
  senseManna: function(manna) { this.sensedManna.push(manna); },
  
  tick: function() {
    this.computeSenseState();
    this.sensedManna = [];
  }
  
};
  
})(Archonia);
