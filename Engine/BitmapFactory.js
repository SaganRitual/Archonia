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
  
  var Bitmap = function(bm) {
    this.bm = bm;
    this.cx = bm.ctx;
  };
  
  Bitmap.prototype = {
    aLine: function(from, to, style, width) {
      if(style === undefined) { style = 'rgb(255, 255, 255)'; }
      if(width === undefined) { width = 1; }
      
      var p = {
        what: "line", strokeStyle: style, lineWidth: width, from: Archonia.Form.XY(from), to: Archonia.Form.XY(to)
      };

      Archonia.Engine.renderSchedule.push(p);
    },
    
    cSquare: function(center, dimension, style, width) {
      var ul = center.minus(dimension / 2, dimension / 2);
      
      var p = {
        what: "cSquare", strokeStyle: style, lineWidth: width, ul: Archonia.Form.XY(ul), dimension: dimension
      };

      Archonia.Engine.renderSchedule.push(p);
    },
    
    rectangle: function(topLeft, widthHeight, style) {
      var p = {
        what: "rectangle", fillStyle: style, topLeft: Archonia.Form.XY(topLeft), widthHeight: Archonia.Form.XY(widthHeight)
      };

      Archonia.Engine.renderSchedule.push(p);
    },
  
    rLine: function(from, relativeTo, style, width) {
      this.aLine(from, relativeTo.plus(from), style, width);
    }
  };
  
  var BitmapFactory = function() {
    
  };
  
  BitmapFactory.prototype = {
    
    archoniaVent: function() {
      var bm = Archonia.Engine.game.add.bitmapData(100, 100);
      var cx = bm.context;

      var g = cx.createRadialGradient(50, 50, 1, 50, 50, 50);

      g.addColorStop(0.00, 'hsla(0, 0%, 0%, 0)');
      g.addColorStop(1.00, 'hsla(0, 0%, 0%, 1)');

      cx.fillStyle = g;
      bm.circle(50, 50, 50);

      bm.update();
      Archonia.Engine.game.cache.addBitmapData('archoniaVent', bm);
    
      return new Bitmap(bm);
    },
    
    archoniaSea: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      
      bm.draw('floor', 0, 0, 1600, 1600);
    
      return new Bitmap(bm);
    },
  
    archoniaSeasons: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      cx.fillStyle = 'white';
      cx.fillRect(0, 0, Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);

      Archonia.Engine.game.cache.addBitmapData('archoniaSeasons', bm);
    
      return new Bitmap(bm);
    },
  
    archoniaGooArchonia: function() {
      var d = Archonia.Axioms.gooDiameterArchonia;
      var r = Archonia.Axioms.gooRadiusArchonia;
      
      var bm = Archonia.Engine.game.add.bitmapData(d, d);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(r, r, r, 'rgba(255, 255, 255, 1)');
      cx.fill();
      
      Archonia.Engine.game.cache.addBitmapData('archoniaGooArchonia', bm);
      return new Bitmap(bm);
    },

    archoniaGooVent: function() {
      var d = Archonia.Axioms.gooDiameterVent;
      var r = Archonia.Axioms.gooRadiusVent;
      
      var bm = Archonia.Engine.game.add.bitmapData(d, d);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(r, r, r, 'rgba(255, 255, 255, 1)');
      cx.fill();
      
      Archonia.Engine.game.cache.addBitmapData('archoniaGooVent', bm);
      return new Bitmap(bm);
    },

    archoniaGooButton: function() {
      var d = Archonia.Axioms.gooDiameterButton;
      var r = Archonia.Axioms.gooRadiusButton;
      
      var bm = Archonia.Engine.game.add.bitmapData(d, d);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(r, r, r, 'rgba(255, 255, 255, 1)');
      cx.fill();
      
      Archonia.Engine.game.cache.addBitmapData('archoniaGooButton', bm);
      return new Bitmap(bm);
    },
  
    archoniaGooSensor: function() {
      var d = Archonia.Axioms.gooDiameterSensor;
      var r = Archonia.Axioms.gooRadiusSensor;

      var bm = Archonia.Engine.game.add.bitmapData(d, d);
      var cx = bm.context;

      cx.beginPath();
      bm.circle(r, r, r, 'hsla(240, 100%, 50%, 0.2)');
      cx.fill();

      Archonia.Engine.game.cache.addBitmapData('archoniaGooSensor', bm);
      return new Bitmap(bm);
    },
  
    debug: function() {
      var bm = Archonia.Engine.game.add.bitmapData(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight);
      var cx = bm.context;

      cx.fillStyle = 'rgba(255, 255, 255, 1)';
      cx.strokeStyle = 'rgba(255, 255, 255, 1)';

      Archonia.Engine.game.add.image(0, 0, bm);

      return new Bitmap(bm);
    },
    
    makeBitmap: function(type) {
      return this[type]();
    }
    
  };
  
  Archonia.Engine.TheBitmapFactory = { start: function() { Archonia.Engine.TheBitmapFactory = new BitmapFactory(); } };
})(Archonia);
