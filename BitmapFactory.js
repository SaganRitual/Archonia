/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
}

(function(Archonia) {
  
  Archonia.Essence.Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  Archonia.Essence.Bitmap.prototype = {
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
    
    cSquare: function(center, dimension, style, width) {
      var ul = center.minus(dimension / 2, dimension / 2);
      
      this.cx.strokeStyle = style;
      this.cx.lineWidth = width;

      this.cx.beginPath();
      this.cx.rect(ul.x, ul.y, dimension, dimension);
      this.cx.stroke();
    },
  
    rLine: function(from, relativeTo, style, width) {
      this.aLine(from, relativeTo.plus(from), style, width);
    }
  };
  
  Archonia.Essence.BitmapFactory = {
    
    archoniaSea: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      var g = cx.createLinearGradient(Archonia.Axioms.gameRadius, 0, Archonia.Axioms.gameRadius, Archonia.Axioms.gameHeight);

      g.addColorStop(0.00, 'hsla(202, 100%, 100%, 1)');
      g.addColorStop(0.40, 'hsla(202, 100%, 50%, 1)');
      g.addColorStop(0.70, 'hsla(202, 100%, 50%, 1)');
      g.addColorStop(0.90, 'hsla(218, 100%, 40%, 1)');
      g.addColorStop(1.00, 'hsla(218, 100%, 00%, 1)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);

      bm.update();
      Archonia.Engine.game.add.image(0, 0, bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaSeasons: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      var g = cx.createLinearGradient(Archonia.Axioms.gameRadius, 0, Archonia.Axioms.gameRadius, Archonia.Axioms.gameHeight);

      g.addColorStop(0.00, 'hsla(202, 100%, 50%, 0.8)');
      g.addColorStop(0.10, 'hsla(202, 100%, 50%, 0.5)');
      g.addColorStop(0.20, 'hsla(202, 100%, 50%, 0.0)');
      g.addColorStop(0.90, 'hsla(218, 100%, 50%, 0.0)');
      g.addColorStop(1.00, 'hsla(218, 100%, 50%, 0.0)');

      cx.fillStyle = g;
      cx.fillRect(0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);

      Archonia.Engine.game.cache.addBitmapData('archoniaSeasons', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaGoo: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.archoniaGooDiameter, Archonia.Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();

      bm.circle(
        Archonia.Axioms.archoniaGooRadius, Archonia.Axioms.archoniaGooRadius,
        Archonia.Axioms.archoniaGooRadius, 'rgba(255, 255, 255, 1)'
      );

      cx.fill();

      Archonia.Engine.game.cache.addBitmapData('archoniaGoo', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    archoniaSensorGoo: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.archoniaGooDiameter, Archonia.Axioms.archoniaGooDiameter);
      var cx = bm.context;

      cx.beginPath();

      bm.circle(
        Archonia.Axioms.archoniaGooRadius, Archonia.Axioms.archoniaGooRadius,
        Archonia.Axioms.archoniaGooRadius, 'hsla(240, 100%, 50%, 0.01)'
      );

      cx.fill();

      Archonia.Engine.game.cache.addBitmapData('archoniaSensorGoo', bm);
    
      return new Archonia.Essence.Bitmap(bm);
    },
  
    debug: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      cx.fillStyle = 'rgba(255, 255, 255, 1)';
      cx.strokeStyle = 'rgba(255, 255, 255, 1)';

      Archonia.Engine.game.add.image(0, 0, bm);

      return new Archonia.Essence.Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return Archonia.Essence.BitmapFactory[type]();
    }
    
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Essence.BitmapFactory;
}
