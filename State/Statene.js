/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var TargetPositionStatene = function() {
    this.dirty = false;
    this.targetPosition = Archonia.Form.XY();
  };
  
  TargetPositionStatene.prototype = {
    clear: function() { this.dirty = false; },
    
    get: function() { if(this.dirty) { return this.targetPosition; } else { return false; } },
    
    set: function(targetPosition, damper, damperDecay) {
      this.targetPosition.set(targetPosition);
      this.damper = damper; this.damperDecay = damperDecay;
      
      this.dirty = true;
    }
  };
  
  Archonia.Form.TargetPositionStatene = TargetPositionStatene;

})(Archonia);
