/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};
var Phaser = Phaser || {};

if(typeof window === "undefined") {
  Phaser = require('./test/support/Phaser.js');
}

(function() {

  A = {
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
      A.game.physics.startSystem(Phaser.Physics.ARCADE);

      A.setupBitmaps();
      A.Sun.ignite();
      A.mannaGenerator = new A.MannaGenerator();

      A.worldColorRange = A.Sun.getWorldColorRange();
      
      A.cursors = A.game.input.keyboard.createCursorKeys();
      A.game.input.onUp.add(A.onMouseUp, A);
      A.game.input.onDown.add(A.onMouseDown, A);
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
      A.prePhaserSetup(config);
    
      A.game = new Phaser.Game(A.gameWidth, A.gameHeight, Phaser.CANVAS);

      A.game.state.add('Archonia', A, false);
      A.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      A.game.state.start('Archonia');
    },

    handleClick: function(/*pointer*/) {
      
    },
    
    integerInRange: function(lo, hi) {
      return A.game.rnd.integerInRange(lo, hi);
    },
    
    prePhaserSetup: function(config) {
      A = Object.assign(A, config);

      A.gameCenter = A.XY(A.gameWidth / 2, A.gameHeight / 2);
      A.gameRadius = A.gameWidth / 2;

  		A.buttonHueRange = new A.Range(240, 0);	// Blue (240) is cold, Red (0) is hot
      A.darknessRange = new A.Range(A.darknessAlphaHi, A.darknessAlphaLo);
      A.oneToZeroRange = new A.Range(1, 0);
      A.temperatureRange = new A.Range(A.temperatureLo, A.temperatureHi);
      A.yAxisRange = new A.Range(A.gameHeight, 0);
      A.zeroToOneRange = new A.Range(0, 1);
      
    },
    
    onMouseDown: function(/*pointer*/) {
      A.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!A.mouseUp) { A.mouseUp = true; A.handleClick(pointer); }
    },

    preload: function() {
      A.game.load.image('particles', 'assets/sprites/pangball.png');
    },
    
    realInRange: function(lo, hi) {
      return A.game.rnd.realInRange(lo, hi);
    },
    
    render: function() {
      A.mannaGenerator.render();
    },

    robalizeAngle: function(computerizedAngle) {
      var a = (computerizedAngle < 0) ? -computerizedAngle : 2 * Math.PI - computerizedAngle;
  
      while(a < 2 * Math.PI) {
        a += 2 * Math.PI;
      }
  
      return a;
    },

    setupBitmaps: function() {
      A.bg = A.BitmapFactory.makeBitmap('archonia');
      A.ag = A.BitmapFactory.makeBitmap('archoniaGoo');
    },
    
    update: function() {
      A.frameCount++;
      
      A.mannaGenerator.tick(A.frameCount);
    }
    
  };
  
})();

if(typeof window === "undefined") {

  module.exports = A;

  A.Range = require('./widgets/Range.js');
  A.Sun = require('./Sun.js');
  
  var xy = require('./widgets/XY.js');
  A.XY = xy.XY;
  A.RandomXY = xy.RandomXY;

  var b = require('./Bitmap.js');
  A.Bitmap = b.Bitmap;
  A.BitmapFactory = b.BitmapFactory;
  
} else {
  window.onload = function() {
    var config = require('./config.js');
    
    A.go(config);
  };
}
