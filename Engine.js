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
      
      Archonia.Engine.letThereBeRanges();

      Archonia.Engine.TheBitmapFactory.start();
      Archonia.Cosmos.Sea = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaSea');
      Archonia.Cosmos.Seasons = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaSeasons');
      Archonia.Essence.Goo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooArchonia');
      Archonia.Essence.SensorGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooSensor');
      Archonia.Essence.ButtonGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooButton');
      Archonia.Essence.AvatarGoo = Archonia.Engine.TheBitmapFactory.makeBitmap('archoniaGooAvatar');

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
    
    letThereBeRanges: function() {
      Archonia.Form.XY.setSafeScratch();
      Archonia.Essence.archonMassRange = new Archonia.Form.Range(0, 10);
      Archonia.Essence.archonTolerableTempRange = new Archonia.Form.Range(50, 200);
      Archonia.Essence.archonSizeRange = new Archonia.Form.Range(0.07, 0.125);
      Archonia.Essence.hueRange = new Archonia.Form.Range(240, 0);	// Blue (240) is cold/small range, Red (0) is hot/large range
      Archonia.Essence.darknessRange = new Archonia.Form.Range(Archonia.Axioms.darknessAlphaHi, Archonia.Axioms.darknessAlphaLo);
      Archonia.Essence.oneToZeroRange = new Archonia.Form.Range(1, 0);
      Archonia.Essence.worldTemperatureRange = new Archonia.Form.Range(Archonia.Axioms.temperatureLo, Archonia.Axioms.temperatureHi);
      Archonia.Essence.yAxisRange = new Archonia.Form.Range(Archonia.Axioms.gameHeight, 0);
      Archonia.Essence.zeroToOneRange = new Archonia.Form.Range(0, 1);
      Archonia.Essence.centeredZeroRange = new Archonia.Form.Range(-1, 1);
      Archonia.Essence.gameDistanceRange = new Archonia.Form.Range(0, Archonia.Axioms.gameHypoteneuse);
    },
    
    onMouseDown: function(/*pointer*/) {
      Archonia.Engine.mouseUp = false;
    },

    onMouseUp: function(pointer) {
      if(!Archonia.Engine.mouseUp) { Archonia.Engine.mouseUp = true; Archonia.Engine.handleClick(pointer); }
    },
    
    render: function() {
      Archonia.Cosmos.skinnyManna.render();
      Archonia.Cosmos.Dronery.render();
    },
    
    start: function() {
      Archonia.Engine.game = new Phaser.Game(Archonia.Axioms.gameWidth, Archonia.Axioms.gameHeight, Phaser.WEBGL);

      Archonia.Engine.game.state.add('Archonia', Archonia.Engine, false);
      Archonia.Engine.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      Archonia.Engine.game.state.start('Archonia');
    },
    
    update: function() {
      frameCount++;
      
      try {
        Archonia.Cosmos.skinnyManna.tick(frameCount);
        Archonia.Cosmos.Archonery.tick();
        Archonia.Cosmos.Year.tick();
      } catch(e) { debugger; }  // jshint ignore: line
    }
    
  };
  
})(Archonia);

if(typeof window === "undefined") {

  module.exports = Archonia.Engine;

} else {
  
  window.onload = function() { Archonia.Engine.start(); };

}
