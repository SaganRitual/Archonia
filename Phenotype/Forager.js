/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

  var yAxisRange = null;

var Forager = function(archon) {
  this.genome = archon.genome;
  this.state = archon.state;
  
  this.gnatfly = new Archonia.Form.Gnatfly(archon);
  
  if(yAxisRange === null) {
    yAxisRange = new Archonia.Form.Range(
      Archonia.Engine.game.world.centerY - Archonia.Axioms.gameRadius,
      Archonia.Engine.game.world.centerY + Archonia.Axioms.gameRadius
    );
  }
};

Forager.prototype = {
  launch: function() {
    this.currentMannaTarget = null;
    this.where = "random";
    this.gnatfly.launch();
  },
  
  tick: function() {
    this.gnatfly.tick();
  }
};

Archonia.Form.Forager = Forager;

})(Archonia);
