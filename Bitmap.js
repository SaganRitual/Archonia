/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
}

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
      var bm = A.game.add.bitmapData(A.game.width, A.game.height);
      var cx = bm.context;

      var g = cx.createLinearGradient(A.game.width / 2, 0, A.game.width / 2, A.game.height);

      g.addColorStop(0.00, 'hsl(202, 100%, 100%)');
      g.addColorStop(0.40, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.70, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.90, 'hsl(218, 100%, 40%)');
      g.addColorStop(1.00, 'hsl(218, 100%, 00%)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, A.game.width, A.game.height);

      bm.update();
      A.game.add.image(0, 0, bm);
    
      return new A.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = A.game.add.bitmapData(A.archoniaGooDiameter, A.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(A.archoniaGooRadius, A.archoniaGooRadius, A.archoniaGooRadius, 'rgba(255, 255, 255, 1)');
      cx.fill();

      A.game.cache.addBitmapData('archoniaGoo', bm);
    
      return new A.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return A.BitmapFactory[type]();
    }
    
  };
})(A);

if(typeof window === "undefined") {
  module.exports = A;
}
