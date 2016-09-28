/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global game */

"use strict";

var A = A || {};

(function(A) {
  
  A.Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  A.Bitmap.prototype = {
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
  
  A.BitmapFactory = {
    
    archonia: function() {
      var bm = game.add.bitmapData(game.width, game.height);
      var cx = bm.context;

      var g = cx.createLinearGradient(game.width / 2, 0, game.width / 2, game.height);

      g.addColorStop(0.00, 'hsl(202, 100%, 100%)');
      g.addColorStop(0.40, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.70, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.90, 'hsl(218, 100%, 40%)');
      g.addColorStop(1.00, 'hsl(218, 100%, 00%)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, game.width, game.height);

      bm.update();
      game.add.image(0, 0, bm);
    
      return new A.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = game.add.bitmapData(A.archoniaGooDiameter, A.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(A.archoniaGooRadius, A.archoniaGooRadius, A.archoniaGooRadius, 'rgba(255, 255, 255, 1)');
      cx.fill();

      game.cache.addBitmapData('archoniaGoo', bm);
    
      return new A.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return A.BitmapFactory[type]();
    }
    
  };
})(A);
