/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var Head = function(archon) {
  this.genome = Archonia.Cosmos.Genomery.makeGeneCluster(archon, "head");
  this.state = Archonia.Cosmos.Statery.makeStateneCluster(archon, "head");
};

Head.prototype = {
  computeAction: function() {
    if(this.state.sensedSkinnyManna.length > 0) {
      var p = this.state.position;
      this.state.sensedSkinnyManna.sort(function(a, b) { return p.getDistanceTo(a) < p.getDistanceTo(b); });
      
      this.state.action = "mannaGrab";
      this.state.where.set(this.state.sensedSkinnyManna[0]);
    } else {
      this.state.action = "stop";
    }
  },
  
  launch: function() {},
  
  tick: function() { this.computeAction(); }
};

Archonia.Form.Head = Head;

})(Archonia);
