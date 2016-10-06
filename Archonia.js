/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};
var Archotype = Archotype || {};
var Phaser = Phaser || {};
var config = config || {};

if(typeof window === "undefined") {
  Phaser = require('./test/support/Phaser.js');
  config = require('./config.js');
}

(function(Archotype) {
  
  Archotype.Archonia = function() {
  };

  Archotype.Archonia.prototype = {
    ag: null,
    archoniaGooDiameter: 100,
    archoniaGooRadius: 50,
    bg: null,
    buttonHueRange: null,
    darknessAlphaHi: 0.3,
    darknessAlphaLo: 0.0,
    darknessRange: null,
    dayLength: 60 * 1000,  // In ms, not ticks
    frameCount: 0,
    gameCenter: null,
    gameHeight: null,
    gameRadius: null,
    gameWidth: null,
    archoniaUniqueObjectId: 0,
    mouseUp: true,
    oneToZeroRange: null,
    temperatureHi: 1000,
    temperatureLo: -1000,
    temperatureRange: null,
    worldColorRange: null,
    zeroToOneRange: null,
    
    clamp: function(value, min, max) {
      value = Math.max(value, min); value = Math.min(value, max); return value;
    },

    computerizeAngle: function(robalizedAngle) {
      while(robalizedAngle > 2 * Math.PI) {
        robalizedAngle -= 2 * Math.PI;
      }
  
      var a = (robalizedAngle > Math.PI) ? 2 * Math.PI - robalizedAngle : -robalizedAngle;
  
      return a;
    },
    
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.setupBitmaps();
      this.sun.ignite();
      this.mannaGenerator = new Archotype.MannaGenerator(this);

      this.worldColorRange = this.sun.getWorldColorRange();
      
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.game.input.onUp.add(this.onMouseUp, this);
      this.game.input.onDown.add(this.onMouseDown, this);
    },
    
    generateBellCurve: function(stopBelow, height, xOffset, widthOfRange) {
      var points = [];
      
      for(var x = xOffset, h = height; h >= stopBelow; x++) {
        h = this.getCurve(x, height, xOffset, widthOfRange);
        points.push(h);
      }
      
      var leftHand = [];
      for(var i = points.length - 1; i > 0; i--) {
        leftHand.push(points[i]);
      }

      return leftHand.concat(points);
    },
      
    getCurve: function(x, a, b, c) {
      var f = -Math.pow(x - b, 2);
      var g = 2 * Math.pow(c, 2);

      return a * Math.pow(Math.E, f / g);
    },
    
    go: function(config) {
      this.prePhaserSetup(config);
    
      this.game = new Phaser.Game(this.gameWidth, this.gameHeight, Phaser.CANVAS);

      this.game.state.add('Archonia', this, false);
      this.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      this.game.state.start('Archonia');
    },

    handleClick: function(/*pointer*/) {
      
    },
    
    integerInRange: function(lo, hi) {
      return Math.floor(this.game.rnd.integerInRange(lo, hi));
    },
    
    prePhaserSetup: function(config) {
      for(var c in config) {
        this[c] = config[c];
      }
      
      this.bitmapFactory = new Archotype.BitmapFactory(this);
      this.sun = new Archotype.Sun(this); 

      this.gameCenter = Archotype.XY(this.gameWidth / 2, this.gameHeight / 2);
      this.gameRadius = this.gameWidth / 2;

  		this.buttonHueRange = new Archotype.Range(240, 0);	// Blue (240) is cold, Red (0) is hot
      this.darknessRange = new Archotype.Range(this.darknessAlphaHi, this.darknessAlphaLo);
      this.oneToZeroRange = new Archotype.Range(1, 0);
      this.temperatureRange = new Archotype.Range(this.temperatureLo, this.temperatureHi);
      this.yAxisRange = new Archotype.Range(this.gameHeight, 0);
      this.zeroToOneRange = new Archotype.Range(0, 1);
      
    },
    
    onMouseDown: function(/*pointer*/) {
      this.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!this.mouseUp) { this.mouseUp = true; this.handleClick(pointer); }
    },

    preload: function() {
      this.game.load.image('particles', 'assets/sprites/pangball.png');
    },
    
    realInRange: function(lo, hi) {
      return this.game.rnd.realInRange(lo, hi);
    },
    
    render: function() {
      this.mannaGenerator.render();
    },

    robalizeAngle: function(computerizedAngle) {
      var a = (computerizedAngle < 0) ? -computerizedAngle : 2 * Math.PI - computerizedAngle;
  
      while(a < 2 * Math.PI) {
        a += 2 * Math.PI;
      }
  
      return a;
    },

    setupBitmaps: function() {
      this.bg = this.bitmapFactory.makeBitmap('archonia');
      this.ag = this.bitmapFactory.makeBitmap('archoniaGoo');
    },
    
    update: function() {
      this.frameCount++;
      
      this.mannaGenerator.tick(this.frameCount);
    }
    
  };
  
})(Archotype);

if(typeof window === "undefined") {

  module.exports = Archotype;

  Archotype.Range = require('./widgets/Range.js');
  Archotype.Sun = require('./Sun.js');
  
  var xy = require('./widgets/XY.js');
  Archotype.XY = xy.XY;
  Archotype.RandomXY = xy.RandomXY;

  var b = require('./Bitmap.js');
  Archotype.Bitmap = b.Bitmap;
  Archotype.BitmapFactory = b.BitmapFactory;

} else {
  window.onload = function() {
    var A = new Archotype.Archonia();
    A.go(config);
  };
}
