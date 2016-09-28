/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var A = A || {};
var game = null;

(function() {

  A = {
    ag: null,
    archoniaGooDiameter: 100,
    archoniaGooRadius: 50,
    bg: null,
    darknessAlphaHi: 0.3,
    darknessAlphaLo: 0.0,
    darknessRange: null,
    dayLength: 5 * 1000,  // In ms, not ticks
    frameCount: 0,
    gameCenter: null,
    gameHeight: 600,
    gameRadius: null,
    gameWidth: 600,
    mouseUp: true,
    oneToZeroRange: null,
    temperatureHi: 1000,
    temperatureLo: -1000,
    temperatureRange: null,
    worldColorRange: null,
    zeroToOneRange: null,
    
    create: function() {
      game.physics.startSystem(Phaser.Physics.ARCADE);

      A.gameCenter = A.XY(A.gameWidth / 2, A.gameHeight / 2);
      A.gameRadius = A.gameWidth / 2;

      A.setupBitmaps();
      A.Sun.ignite();
      A.MannaGenerator.bestow();

      A.darknessRange = new A.Range(A.darknessAlphaHi, A.darknessAlphaLo);
      A.oneToZeroRange = new A.Range(1, 0);
      A.temperatureRange = new A.Range(A.temperatureLo, A.temperatureHi);
      A.worldColorRange = A.Sun.getWorldColorRange();
      A.yAxisRange = new A.Range(A.gameHeight, 0);
      A.zeroToOneRange = new A.Range(0, 1);
      
      A.cursors = game.input.keyboard.createCursorKeys();
      game.input.onUp.add(A.onMouseUp, A);
      game.input.onDown.add(A.onMouseDown, A);
    },
    
    handleClick: function(/*pointer*/) {
      
    },
    
    integerInRange: function(lo, hi) {
      return game.rnd.integerInRange(lo, hi);
    },
    
    onMouseDown: function(/*pointer*/) {
      A.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!A.mouseUp) { A.mouseUp = true; A.handleClick(pointer); }
    },

    preload: function() {
      
    },
    
    render: function() {
      A.MannaGenerator.render();
    },

    setupBitmaps: function() {
      A.bg = A.BitmapFactory.makeBitmap('archonia');
      A.ag = A.BitmapFactory.makeBitmap('archoniaGoo');
    },
    
    update: function() {
      A.frameCount++;
      
      A.MannaGenerator.tick(A.frameCount);
    }
    
  };
  
})();

window.onload = function() {
  game = new Phaser.Game(A.gameWidth, A.gameHeight, Phaser.CANVAS);

  game.state.add('Archonia', A, false);
  game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

  game.state.start('Archonia');
};
