/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {}, Axioms = Axioms || {};

if(typeof window === "undefined") {
  Axioms = require('./Axioms.js');
  Archotype = require('./Archonia.js');
}

(function(Archotype) {
  
  Archotype.Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  Archotype.Bitmap.prototype = {
    aLine: function(from, to, style, width) {
      if(style === undefined) { style = 'rgb(255, 255, 255)'; }
      if(width === undefined) { width = 1; }

      this.cx.strokeStyle = style;
      this.cx.lineWidth = width;

      this.cx.beginPath();
      this.cx.moveTo(from.x, from.y);
      this.cx.lineTo(to.x, to.y);
      this.cx.stroke();
    },
  
    rLine: function(from, relativeTo, style, width) {
      this.aLine(from, relativeTo.plus(from), style, width);
    }
  };
  
  Archotype.BitmapFactory = function(game) {
    this.game = game;
  };
  
  Archotype.BitmapFactory.prototype = {
    
    archonia: function() {
      var bm = this.game.add.bitmapData(Axioms.gameWidth, Axioms.gameHeight);
      var cx = bm.context;

      var g = cx.createLinearGradient(Axioms.gameRadius, 0, Axioms.gameRadius, Axioms.gameWidth);

      g.addColorStop(0.00, 'hsl(202, 100%, 100%)');
      g.addColorStop(0.40, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.70, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.90, 'hsl(218, 100%, 40%)');
      g.addColorStop(1.00, 'hsl(218, 100%, 00%)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, Axioms.gameWidth, Axioms.gameHeight);

      bm.update();
      this.game.add.image(0, 0, bm);
    
      return new Archotype.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = this.game.add.bitmapData(Axioms.archoniaGooDiameter, Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(Axioms.archoniaGooRadius, Axioms.archoniaGooRadius, Axioms.archoniaGooRadius, 'rgba(255, 255, 255, 1)');
      cx.fill();

      this.game.cache.addBitmapData('archoniaGoo', bm);
    
      return new Archotype.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return this[type]();
    }
    
  };
})(Archotype);

if(typeof window === "undefined") {
  module.exports = { Bitmap: Archotype.Bitmap, BitmapFactory: Archotype.BitmapFactory};
}
