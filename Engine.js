/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var frameCount = 0;

  Archonia.Engine = {
    mouseUp: true,
    
    create: function() {
      Archonia.Essence.archoniaUniqueObjectId = 0;
      
      Archonia.Engine.game.physics.startSystem(Phaser.Physics.ARCADE);

      Archonia.Engine.cursors = Archonia.Engine.game.input.keyboard.createCursorKeys();
      Archonia.Engine.game.input.onUp.add(Archonia.Engine.onMouseUp, Archonia.Engine);
      Archonia.Engine.game.input.onDown.add(Archonia.Engine.onMouseDown, Archonia.Engine);
      
      Archonia.Essence.Logger.initialize(1000);

      Archonia.Cosmos.Sea = Archonia.Essence.BitmapFactory.makeBitmap('archoniaSea');
      Archonia.Cosmos.Seasons = Archonia.Essence.BitmapFactory.makeBitmap('archoniaSeasons');
      Archonia.Essence.Goo = Archonia.Essence.BitmapFactory.makeBitmap('archoniaGoo');
      Archonia.Essence.SensorGoo = Archonia.Essence.BitmapFactory.makeBitmap('archoniaSensorGoo');
      Archonia.Essence.Dbitmap = Archonia.Essence.BitmapFactory.makeBitmap('debug');

      Archonia.Cosmos.Sun.ignite();
      Archonia.Cosmos.Year.start();
      
      Archonia.Cosmos.allTheManna = [];
      
      Archonia.Cosmos.skinnyManna = new Archonia.Cosmos.MannaGenerator();
      Archonia.Cosmos.skinnyManna.initialize(Archonia.Cosmos.allTheManna);
      Archonia.Cosmos.skinnyManna.start();

      Archonia.Cosmos.FamilyTree = new Archonia.Cosmos.FamilyTree();
      
      Archonia.Cosmos.Archonery.start();
    },

    handleClick: function(/*pointer*/) {
      
    },
    
    onMouseDown: function(/*pointer*/) {
      Archonia.Engine.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!Archonia.Engine.mouseUp) { Archonia.Engine.mouseUp = true; Archonia.Engine.handleClick(pointer); }
    },

    preload: function() {
      Archonia.Engine.game.load.image('particles', 'assets/sprites/pangball.png');
    },
    
    render: function() {
      Archonia.Cosmos.skinnyManna.render();
    },
    
    start: function() {
      Archonia.Engine.game = new Phaser.Game(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight, Phaser.CANVAS);

      Archonia.Engine.game.state.add('Archonia', Archonia.Engine, false);
      Archonia.Engine.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      Archonia.Engine.game.state.start('Archonia');
    },
    
    update: function() {
      frameCount++;
      
      Archonia.Essence.Dbitmap.bm.clear();
      
      Archonia.Cosmos.skinnyManna.tick(frameCount);
      Archonia.Cosmos.Archonery.tick(frameCount);
      Archonia.Cosmos.Year.tick();
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {

  module.exports = Archonia.Engine;

} else {
  
  window.onload = function() { Archonia.Engine.start(); };

}
