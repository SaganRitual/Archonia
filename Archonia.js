/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {}, Axioms = Axioms || {};
var Phaser = Phaser || {};

if(typeof window === "undefined") {
  Axioms = require('./Axioms.js');
  Archotype.Sun = require('./Sun.js');
  Archotype.MannaGenerator = require('./Manna.js');
  
  var b = require('./Bitmap.js');
  Archotype.BitmapFactory = b.BitmapFactory; Archotype.Bitmap = Archotype.Bitmap;
  
  Phaser = require('./test/support/Phaser.js');
}

(function(Archotype) {
  
  Archotype.Archonia = function() {
  };

  Archotype.Archonia.prototype = {
    mouseUp: true,
    
    create: function() {
      this.game.physics.startSystem(Phaser.Physics.ARCADE);

      this.bitmapFactory = new Archotype.BitmapFactory(this.game);
      this.setupBitmaps();

      this.sun = new Archotype.Sun(this); 
      this.sun.ignite();

      this.mannaGenerator = new Archotype.MannaGenerator(this.game);

      this.worldColorRange = this.sun.getWorldColorRange();
      
      this.cursors = this.game.input.keyboard.createCursorKeys();
      this.game.input.onUp.add(this.onMouseUp, this);
      this.game.input.onDown.add(this.onMouseDown, this);
    },
    
    go: function() {
      this.game = new Phaser.Game(Axioms.gameWidth, Axioms.gameHeight, Phaser.CANVAS);

      this.game.state.add('Archonia', this, false);
      this.game.state.add('Extinction', { create: function() { console.log("They're all dead, and you're a terrible person"); } }, false);

      this.game.state.start('Archonia');
    },

    handleClick: function(/*pointer*/) {
      
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
    
    render: function() {
      this.mannaGenerator.render();
    },

    setupBitmaps: function() {
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

} else {
  window.onload = function() {
    var A = new Archotype.Archonia(); A.go();
  };
}
