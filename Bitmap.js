/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};
var Archotype = Archotype || {};

if(typeof window === "undefined") {
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
  
  Archotype.BitmapFactory = function(A) {
    this.A = A;
  };
  
  Archotype.BitmapFactory.prototype = {
    
    archonia: function() {
      var bm = this.A.game.add.bitmapData(this.A.game.width, this.A.game.height);
      var cx = bm.context;

      var g = cx.createLinearGradient(this.A.game.width / 2, 0, this.A.game.width / 2, this.A.game.height);

      g.addColorStop(0.00, 'hsl(202, 100%, 100%)');
      g.addColorStop(0.40, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.70, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.90, 'hsl(218, 100%, 40%)');
      g.addColorStop(1.00, 'hsl(218, 100%, 00%)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, this.A.game.width, this.A.game.height);

      bm.update();
      this.A.game.add.image(0, 0, bm);
    
      return new Archotype.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = this.A.game.add.bitmapData(this.A.archoniaGooDiameter, this.A.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(this.A.archoniaGooRadius, this.A.archoniaGooRadius, this.A.archoniaGooRadius, 'rgba(255, 255, 255, 1)');
      cx.fill();

      this.A.game.cache.addBitmapData('archoniaGoo', bm);
    
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
