/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var Debug = function() {
    this.bm = Archonia.Engine.game.debug.bitmap;
    this.ctx = Archonia.Engine.game.debug.context;
    
  };
  
  Debug.prototype = {
    
    aLine: function(from, to, style, width) {
      Archonia.Engine.game.debug.text("Debugging", 25, 25);

      if(style === undefined) { style = 'white'; }
      if(width === undefined) { width = 1; }
      
      this.ctx.strokeStyle = style; this.ctx.lineWidth = width;

      this.ctx.beginPath(); this.ctx.moveTo(from.x, from.y); this.ctx.lineTo(to.x, to.y); this.ctx.stroke();
    },
    
    cSquare: function(center, dimension, style, width) {
      var ul = center.minus(dimension / 2, dimension / 2);

      this.ctx.strokeStyle = style; this.ctx.lineWidth = width;
      this.ctx.beginPath(); this.ctx.rect(ul.x, ul.y, dimension, dimension); this.ctx.stroke();
    },
    
    rLine: function(from, to, style, width) {
      this.aLine(from, to.plus(from), style, width);
    },
    
    rectangle: function(topLeft, widthHeight, style) {
      var p = {
        what: "rectangle", fillStyle: style, topLeft: Archonia.Form.XY(topLeft), widthHeight: Archonia.Form.XY(widthHeight)
      };

      Archonia.Engine.renderSchedule.push(p);
    },
    
    text: function(text, where) {
      Archonia.Engine.game.debug.text(text, where.x, where.y);
    }
    
  };
  
  Archonia.Engine.TheDebug = { start: function() { Archonia.Engine.TheDebug = new Debug(); } };

})(Archonia);
