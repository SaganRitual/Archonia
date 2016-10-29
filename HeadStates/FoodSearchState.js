/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
var yAxisRange = null;
  
Archonia.Form.FoodSearchState = function(headState) {
  this.headState = headState;
  
  this.where = null;
  this.whereIsh = Archonia.Form.XY();
  
  if(yAxisRange === null) {
    yAxisRange = new Archonia.Form.Range(
      Archonia.Engine.game.world.centerY + Archonia.Axioms.gameRadius,
      Archonia.Engine.game.world.centerY - Archonia.Axioms.gameRadius
    );
  }
};

Archonia.Form.FoodSearchState.prototype = {
  computeFoodSearchState: function(tempSignal, hungerSignal) {
    var ySignal = Archonia.Essence.centeredZeroRange.convertPoint(this.headState.head.archon.position.y, yAxisRange);
    
    var netTemp = Math.abs(tempSignal) * this.headState.head.archon.genome.tempToleranceMultiplier;
    var netHunger = hungerSignal * this.headState.head.archon.genome.hungerToleranceMultiplier;
    
    if(netTemp > netHunger) {
      // If temp wins, then we just go in the direction that gets us
      // closer to a temp signal of zero
      if(tempSignal > 0) { this.where = "randomDownOnly"; } else { this.where = "randomUpOnly"; }
      
    } else {
      // Note: when we compare the tempSignal to the ySignal, but that doesn't
      // really work in principle. The temp signal is about our own health; what
      // I'm trying to do here is get us to go to where the manna is most
      // likely to be. Won't work if our own temp signal doesn't correspond to
      // the way the manna grows. Also I think it defeats the whole fat manna thing.
      // Come back to this when not trying to fix a hundred other things
      var upOk = true, downOk = true;
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal >= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal <= 0 && tempSignal > 0) { upOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal <= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) < Math.abs(tempSignal) && ySignal >= 0 && tempSignal > 0) { upOk = false; }

      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal >= 0 && tempSignal < 0) { upOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal <= 0 && tempSignal > 0) { downOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal <= 0 && tempSignal < 0) { downOk = false; }
      if(Math.abs(ySignal) > Math.abs(tempSignal) && ySignal >= 0 && tempSignal > 0) { upOk = false; }
      
      if(upOk && downOk) { this.where = "random"; }
      else if(upOk)      { this.where = "randomUpOnly"; }
      else               { this.where = "randomDownOnly"; }
    }
    
    /*Archonia.Essence.Logger.log(
      tempSignal.toFixed(2), hungerSignal.toFixed(2), ySignal.toFixed(2),
      netTemp.toFixed(2), netHunger.toFixed(2), this.where
    );*/
  },
  
  tick: function(tempSignal, hungerSignal) {
    this.computeFoodSearchState(tempSignal, hungerSignal);
  } 
};

})(Archonia);