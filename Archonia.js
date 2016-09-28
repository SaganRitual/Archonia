/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var A = A || {};
var game = null;

(function() {

  A = {
    ag: null,
    bg: null,
    gameCenter: null,
    gameHeight: 600,
    gameWidth: 600,
    mouseUp: true,
    
    create: function() {
      A.gameCenter = { x: A.gameWidth / 2, y: A.gameHeight / 2 };
      
      game.physics.startSystem(Phaser.Physics.ARCADE);

      A.setupBitmaps();
      A.Sun.ignite();
      
      A.cursors = game.input.keyboard.createCursorKeys();
      game.input.onUp.add(A.onMouseUp, A);
      game.input.onDown.add(A.onMouseDown, A);
    },
    
    handleClick: function(/*pointer*/) {
      
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
      
    },

    setupBitmaps: function() {
      A.bg = A.BitmapFactory.makeBitmap('archonia');
      A.ag = A.BitmapFactory.makeBitmap('archoniaGoo');
    },
    
    update: function() {
      
    }
    
  };
  
})();

window.onload = function() {
  game = new Phaser.Game(A.gameWidth, A.gameHeight, Phaser.CANVAS);

  game.state.add('Archonia', A, false);
  game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

  game.state.start('Archonia');
};
