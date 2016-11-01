/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {
  
  var Statene = function() {
    this.dirty = false;
  };
  
  Statene.prototype = {
    clear: function() { this.dirty = false; }
  };
  
  var TargetPositionStatene = function() {
    this.targetPosition = Archonia.Form.XY();
    Statene.call(this);
  };
  
  TargetPositionStatene.prototype = Object.create(Statene.prototype);
  TargetPositionStatene.prototype.constructor = TargetPositionStatene;
  
  TargetPositionStatene.prototype.get = function() {
    if(this.dirty) { return this.targetPosition; } else { return false; }
  };
    
  TargetPositionStatene.prototype.set = function(targetPosition, damper, damperDecay) {
    this.targetPosition.set(targetPosition);
    this.damper = damper; this.damperDecay = damperDecay;
    
    this.dirty = true;
  };
  
  var ButtonColorStatene = function() {
    this.color = tinycolor();
    Statene.call(this);
  };
  
  ButtonColorStatene.prototype = {
    
  };
  
  Archonia.Form.TargetPositionStatene = TargetPositionStatene;
  Archonia.Form.ButtonColorStatene = ButtonColorStatene;

})(Archonia);
