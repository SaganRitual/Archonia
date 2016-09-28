/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global game, Phaser, Rob */

"use strict";

var A = A || {};

A.Sun = (function(A) {
  
  var dayLength = 5 * 1000;  // tweens run in milliseconds, not ticks
  var easingFunction = Phaser.Easing.Quartic.InOut;
  var darknessAlphaHi = 0.3;
  var darknessAlphaLo = 0.0;
  
  return {
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Rob.clamp(
        Rob.globals.zeroToOneRange.convertPoint(
          A.Sun.darkness.alpha, Rob.globals.darknessRange
        ), 0, 1
      );
    },
    
    ignite: function() {
      A.Sun.darkness = game.add.sprite(A.gameCenter.x, A.gameCenter.y, game.cache.getBitmapData('archoniaGoo'));

      A.Sun.darkness.anchor.setTo(0.5, 0.5);
      A.Sun.darkness.scale.setTo(10, 10);     // Any size is fine, as long as it covers the world
      A.Sun.darkness.alpha = darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      A.Sun.darkness.tint = 0x9900;

      A.Sun.darknessTween = game.add.tween(A.Sun.darkness).to(
        {alpha: darknessAlphaLo}, dayLength, easingFunction, true, 0, -1, true
      );
  
      A.Sun.dayNumber = 1;
  
      /*A.Sun.darknessTween.onLoop.add(function() {
        Rob.globals.archonia.archons.dailyReport(A.Sun.dayNumber++);
      }, A.Sun);*/
    }
  };
})(A);

