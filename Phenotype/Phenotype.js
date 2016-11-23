/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var Archonoid = function(archonite) { this.archonite = archonite; Archonia.Form.XY.call(this); };

Archonoid.prototype = Object.create(Archonia.Form.XY.prototype);
Archonoid.prototype.constructor = Archonoid;

Object.defineProperty(Archonoid.prototype, 'x', {
  get: function x() { return this.archonite.x; },
  set: function x(v) { this.archonite.x = v; }
});

Object.defineProperty(Archonoid.prototype, 'y', {
  get: function y() { return this.archonite.y; },
  set: function y(v) { this.archonite.y = v; }
});


var TargetPosition = function() {
  this.targetPosition = Archonia.Form.XY();
  
  this.clear();
};

TargetPosition.prototype = {
  clear: function() { this.dirty = false; },
  
  get: function() { if(this.dirty) { return this.targetPosition; } else { return false; } },
  
  set: function(targetPosition, damper, damperDecay) {
    this.targetPosition.set(targetPosition);
    this.damper = damper; this.damperDecay = damperDecay;
  
    this.dirty = true;
  }
};


Archonia.Form.Archonoid = Archonoid;
Archonia.Form.TargetPosition = TargetPosition;

})(Archonia);
