/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};
var Phaser = Phaser || {};

if(typeof window === "undefined") {
  A = require('./Archonia.js');
  A.MannaGenerator = require('./Manna.js');
  
  Phaser = require('./test/support/Phaser.js');
}

A.Sun = (function(A) {
  
  var easingFunction = Phaser.Easing.Quartic.InOut;
  
  return {
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return A.clamp(A.zeroToOneRange.convertPoint(A.Sun.darkness.alpha, A.darknessRange), 0, 1);
    },
    
    getTemperature: function(where, whereY) {
      where.set(where, whereY);
      where.floor();

      var rgb = {};
      A.bg.bm.getPixelRGB(where.x, where.y, rgb, true);

      var lumaComponent = A.temperatureRange.convertPoint(rgb.l, A.worldColorRange);

      var darkness = A.Sun.darkness.alpha;
      var darknessComponent = A.temperatureRange.convertPoint(darkness, A.darknessRange);

      var yAxisComponent = A.temperatureRange.convertPoint(where.y, A.yAxisRange);

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (yAxisComponent + 10 * (lumaComponent + darknessComponent)) / 21;

      return final;
    },
    
    getWorldColorRange: function() {
      var rgb = {};

      A.bg.bm.getPixelRGB(A.gameRadius, 10, rgb, true);
      var lumaTL = rgb.l;

      A.bg.bm.getPixelRGB(
        Math.floor(A.gameRadius), Math.floor(A.gameHeight - 10), rgb, true
      );
      var lumaBR = rgb.l;

      // Bottom right is the cold end, top left is the hot
      return new A.Range(lumaBR, lumaTL);
    },
    
    ignite: function() {
      A.Sun.darkness = A.game.add.sprite(A.gameCenter.x, A.gameCenter.y, A.game.cache.getBitmapData('archoniaGoo'));

      var scale = A.gameWidth / A.archoniaGooRadius;
      A.Sun.darkness.scale.setTo(scale, scale); // Big enough to cover the world

      A.Sun.darkness.anchor.setTo(0.5, 0.5);
      A.Sun.darkness.alpha = A.darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      A.Sun.darkness.tint = 0x9900;

      A.Sun.darknessTween = A.game.add.tween(A.Sun.darkness).to(
        {alpha: A.darknessAlphaLo}, A.dayLength, easingFunction, true, 0, -1, true
      );
  
      A.Sun.dayNumber = 1;
  
      /*A.Sun.darknessTween.onLoop.add(function() {
        A.archonia.archons.dailyReport(A.Sun.dayNumber++);
      }, A.Sun);*/
    }
  };
})(A);

if(typeof window === "undefined") {
  module.exports = A.Sun;
}
