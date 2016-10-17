/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Engine.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
  Archonia.Essence.BitmapFactory = require('./BitmapFactory.js');
  Archonia.Form.Range = require('./widgets/Range.js');
  Archonia.Form.XY = require('./widgets/XY.js').XY;

  Archonia.Cosmos.Sea = Archonia.Essence.BitmapFactory.makeBitmap('archoniaSea');
}

(function(Archonia) {
  
  Archonia.Cosmos.Sun = {
    darkness: null,
    darknessTween: null,
    dayNumber: null,
    easingFunction: Phaser.Easing.Quartic.InOut,
    sunGoo: null,
  
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Archonia.Axioms.clamp(
        Archonia.Essence.zeroToOneRange.convertPoint(Archonia.Cosmos.Sun.darkness.alpha, Archonia.Essence.darknessRange), 0, 1
      );
    },
    
    getTemperature: function(w, wY) {
      if(w === undefined || !(w instanceof Archonia.Form.XY)) { throw new Error("Bad arguments"); }

      var where = Archonia.Form.XY(w, wY).floored();

      var rgb = {};
      Archonia.Cosmos.Sea.bm.getPixelRGB(where.x, where.y, rgb, true);

      var lumaComponent = Archonia.Essence.temperatureRange.convertPoint(rgb.l, Archonia.Essence.worldColorRange);

      var darknessComponent = Archonia.Essence.temperatureRange.convertPoint(Archonia.Cosmos.Sun.darkness.alpha, Archonia.Essence.darknessRange);

      var yAxisComponent = Archonia.Essence.temperatureRange.convertPoint(where.y, Archonia.Essence.yAxisRange);

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (yAxisComponent + 10 * (lumaComponent + darknessComponent)) / 21;

      return final;
    },
    
    getWorldColorRange: function() {
      var rgb = {};

      Archonia.Cosmos.Sea.bm.getPixelRGB(Archonia.Axioms.gameRadius, 10, rgb, true);
      var lumaTL = rgb.l;

      Archonia.Cosmos.Sea.bm.getPixelRGB(
        Math.floor(Archonia.Axioms.gameRadius), Math.floor(Archonia.Axioms.gameHeight - 10), rgb, true
      );
      var lumaBR = rgb.l;

      // Bottom right is the cold end, top left is the hot
      return new Archonia.Form.Range(lumaBR, lumaTL);
    },
    
    ignite: function() {
      Archonia.Cosmos.Sun.darkness = Archonia.Engine.game.add.sprite(
        Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y, Archonia.Engine.game.cache.getBitmapData('archoniaGoo')
      );

      var scale = Archonia.Axioms.gameWidth / Archonia.Axioms.archoniaGooRadius;
      Archonia.Cosmos.Sun.darkness.scale.setTo(scale, scale); // Big enough to cover the world

      Archonia.Cosmos.Sun.darkness.anchor.setTo(0.5, 0.5);
      Archonia.Cosmos.Sun.darkness.alpha = Archonia.Axioms.darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      Archonia.Cosmos.Sun.darkness.tint = 0x9900;
      
      Archonia.Cosmos.Sun.darkness.visible = true;

      Archonia.Cosmos.Sun.darknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Sun.darkness).to(
        {alpha: Archonia.Axioms.darknessAlphaLo}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
      );
  
      Archonia.Cosmos.Sun.dayNumber = 1;

      Archonia.Essence.worldColorRange = Archonia.Cosmos.Sun.getWorldColorRange();
      
      /*Archonia.Cosmos.Sun.darknessTween.onLoop.add(function() {
        Archonia.Axioms.archonia.archons.dailyReport(this.Archonia.Cosmos.Sun.dayNumber++);
      }, this);*/
    }
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Sun;
}
