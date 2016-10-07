/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Cosmos.MannaGenerator = require('./Manna.js');
  Archonia.Cosmos.Sun = require('./Sun.js');
  
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
}

(function(Archonia) {

  Archonia.Engine = {
    mouseUp: true,
    
    create: function() {
      Archonia.Engine.game.physics.startSystem(Phaser.Physics.ARCADE);

      Archonia.Cosmos.Sun.ignite();
      Archonia.Cosmos.MannaGenerator.start();

      Archonia.Engine.cursors = Archonia.Engine.game.input.keyboard.createCursorKeys();
      Archonia.Engine.game.input.onUp.add(Archonia.Engine.onMouseUp, Archonia.Engine);
      Archonia.Engine.game.input.onDown.add(Archonia.Engine.onMouseDown, Archonia.Engine);
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
      Archonia.Engine.mannaGenerator.render();
    },

    setupBitmaps: function() {
      Archonia.Engine.ag = Archonia.Engine.bitmapFactory.makeBitmap('archoniaGoo');
    },
    
    start: function() {
      Archonia.Engine.game = new Phaser.Game(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight, Phaser.CANVAS);

      Archonia.Engine.game.state.add('Archonia', Archonia.Engine, false);
      Archonia.Engine.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      Archonia.Engine.game.state.start('Archonia');
    },
    
    update: function() {
      Archonia.Engine.frameCount++;
      
      Archonia.Engine.mannaGenerator.tick(Archonia.Engine.frameCount);
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {

  module.exports = Archonia.Engine;

} else {
  
  window.onload = function() { Archonia.Engine.start(); };

}
