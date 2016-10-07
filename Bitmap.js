/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Form: {}, Phaser: {} } || {};

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Phaser.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
}

(function(Archonia) {
  
  Archonia.Form.Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  Archonia.Form.Bitmap.prototype = {
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
  
  Archonia.Form.BitmapFactory = {
    
    archonia: function() {
      var bm = Archonia.Phaser.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      var g = cx.createLinearGradient(Archonia.Axioms.gameRadius, 0, Archonia.Axioms.gameRadius, Archonia.Axioms.gameHeight);

      g.addColorStop(0.00, 'hsl(202, 100%, 100%)');
      g.addColorStop(0.40, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.70, 'hsl(202, 100%, 50%)');
      g.addColorStop(0.90, 'hsl(218, 100%, 40%)');
      g.addColorStop(1.00, 'hsl(218, 100%, 00%)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);

      bm.update();
      Archonia.Phaser.game.add.image(0, 0, bm);
    
      return new Archonia.Form.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = Archonia.Phaser.game.add.bitmapData(Archonia.Axioms.archoniaGooDiameter, Archonia.Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();

      bm.circle(
        Archonia.Form.archoniaGooRadius, Archonia.Axioms.archoniaGooRadius,
        Archonia.Form.archoniaGooRadius, 'rgba(255, 255, 255, 1)'
      );

      cx.fill();

      Archonia.Phaser.game.cache.addBitmapData('archoniaGoo', bm);
    
      return new Archonia.Form.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return Archonia.Form.BitmapFactory[type]();
    }
    
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.BitmapFactory;
}
