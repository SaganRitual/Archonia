/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {}, Axioms = Axioms|| {};
var Phaser = Phaser || {};

if(typeof window === "undefined") {
  Axioms = require('./Axioms.js');
  Archotype = require('./Archonia.js');
  Archotype.MannaGenerator = require('./Manna.js');
  
  Phaser = require('./test/support/Phaser.js');
}

(function() {
  
  var easingFunction = Phaser.Easing.Quartic.InOut;
  
  Archotype.Sun = function(archonia) {
    this.game = archonia.game;
    
    this.sunStuff = archonia.bitmapFactory.makeBitmap('archonia');
  };
  
  Archotype.Sun.prototype = {
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Axioms.clamp(Axioms.zeroToOneRange.convertPoint(this.darkness.alpha, Axioms.darknessRange), 0, 1);
    },
    
    getTemperature: function(where, whereY) {
      where.set(where, whereY);
      where.floor();

      var rgb = {};
      this.sunStuff.bm.getPixelRGB(where.x, where.y, rgb, true);

      var lumaComponent = Axioms.temperatureRange.convertPoint(rgb.l, Axioms.worldColorRange);

      var darkness = this.darkness.alpha;
      var darknessComponent = Axioms.temperatureRange.convertPoint(darkness, Axioms.darknessRange);

      var yAxisComponent = Axioms.temperatureRange.convertPoint(where.y, Axioms.yAxisRange);

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (yAxisComponent + 10 * (lumaComponent + darknessComponent)) / 21;

      return final;
    },
    
    getWorldColorRange: function() {
      var rgb = {};

      this.sunStuff.bm.getPixelRGB(Axioms.gameRadius, 10, rgb, true);
      var lumaTL = rgb.l;

      this.sunStuff.bm.getPixelRGB(
        Math.floor(Axioms.gameRadius), Math.floor(Axioms.gameHeight - 10), rgb, true
      );
      var lumaBR = rgb.l;

      // Bottom right is the cold end, top left is the hot
      return new Archotype.Range(lumaBR, lumaTL);
    },
    
    ignite: function() {
      this.darkness = this.game.add.sprite(Axioms.gameCenter.x, Axioms.gameCenter.y, this.game.cache.getBitmapData('archoniaGoo'));

      var scale = Axioms.gameWidth / Axioms.archoniaGooRadius;
      this.darkness.scale.setTo(scale, scale); // Big enough to cover the world

      this.darkness.anchor.setTo(0.5, 0.5);
      this.darkness.alpha = Axioms.darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      this.darkness.tint = 0x9900;

      this.darknessTween = this.game.add.tween(this.darkness).to(
        {alpha: Axioms.darknessAlphaLo}, Axioms.dayLength, easingFunction, true, 0, -1, true
      );
  
      this.dayNumber = 1;
  
      /*this.darknessTween.onLoop.add(function() {
        Axioms.archonia.archons.dailyReport(this.dayNumber++);
      }, this);*/
    }
  };
})();

if(typeof window === "undefined") {
  module.exports = Archotype.Sun;
}
