/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Form: {}, Phaser: {} } || {};

if(typeof window === "undefined") {
  var Phaser = require('./test/support/Phaser.js');
  Archonia.Phaser.game = new Phaser.Game();
  
  Archonia.Axioms = require('./Axioms.js');
  Archonia.Essence = require('./Essence.js');
  Archonia.Essence.bitmapFactory = require('./Bitmap.js');
  Archonia.Form.Range = require('./widgets/Range.js');
}

(function(Archonia) {
  
  var darkness = null;
  var darknessTween = null;
  var dayNumber = null;
  var easingFunction = Phaser.Easing.Quartic.InOut;
  var sunGoo = null;
  
  Archonia.Cosmos.Sun = {
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Archonia.Axioms.clamp(
        Archonia.Essence.zeroToOneRange.convertPoint(darkness.alpha, Archonia.Essence.darknessRange), 0, 1
      );
    },
    
    getTemperature: function(where, whereY) {
      where.set(where, whereY);
      where.floor();

      var rgb = {};
      sunGoo.bm.getPixelRGB(where.x, where.y, rgb, true);

      var lumaComponent = Archonia.Axioms.temperatureRange.convertPoint(rgb.l, Archonia.Axioms.worldColorRange);

      var darknessComponent = Archonia.Axioms.temperatureRange.convertPoint(darkness.alpha, Archonia.Axioms.darknessRange);

      var yAxisComponent = Archonia.Axioms.temperatureRange.convertPoint(where.y, Archonia.Axioms.yAxisRange);

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (yAxisComponent + 10 * (lumaComponent + darknessComponent)) / 21;

      return final;
    },
    
    getWorldColorRange: function() {
      var rgb = {};

      sunGoo.bm.getPixelRGB(Archonia.Axioms.gameRadius, 10, rgb, true);
      var lumaTL = rgb.l;

      sunGoo.bm.getPixelRGB(
        Math.floor(Archonia.Axioms.gameRadius), Math.floor(Archonia.Axioms.gameHeight - 10), rgb, true
      );
      var lumaBR = rgb.l;

      // Bottom right is the cold end, top left is the hot
      return new Archonia.Form.Range(lumaBR, lumaTL);
    },
    
    ignite: function() {
      sunGoo = Archonia.Essence.bitmapFactory.makeBitmap('archonia');
      
      darkness = Archonia.Phaser.game.add.sprite(
        Archonia.Axioms.gameCenter.x, Archonia.Axioms.gameCenter.y, Archonia.Phaser.game.cache.getBitmapData('archoniaGoo')
      );

      var scale = Archonia.Axioms.gameWidth / Archonia.Axioms.archoniaGooRadius;
      darkness.scale.setTo(scale, scale); // Big enough to cover the world

      darkness.anchor.setTo(0.5, 0.5);
      darkness.alpha = Archonia.Axioms.darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      darkness.tint = 0x9900;

      darknessTween = Archonia.Phaser.game.add.tween(darkness).to(
        {alpha: Archonia.Axioms.darknessAlphaLo}, Archonia.Axioms.dayLength, easingFunction, true, 0, -1, true
      );
  
      dayNumber = 1;

      Archonia.Form.worldColorRange = Archonia.Cosmos.Sun.getWorldColorRange();
      
      /*darknessTween.onLoop.add(function() {
        Archonia.Axioms.archonia.archons.dailyReport(this.dayNumber++);
      }, this);*/
    }
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Sun;
}
