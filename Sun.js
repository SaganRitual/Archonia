/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archotype = Archotype || {};
var Phaser = Phaser || {};

if(typeof window === "undefined") {
  Archotype = require('./Archonia.js');
  Archotype.MannaGenerator = require('./Manna.js');
  
  Phaser = require('./test/support/Phaser.js');
}

(function() {
  
  var easingFunction = Phaser.Easing.Quartic.InOut;
  
  Archotype.Sun = function(A) {
    this.A = A;
  };
  
  Archotype.Sun.prototype = {
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return this.A.clamp(this.A.zeroToOneRange.convertPoint(this.darkness.alpha, this.A.darknessRange), 0, 1);
    },
    
    getTemperature: function(where, whereY) {
      where.set(where, whereY);
      where.floor();

      var rgb = {};
      this.A.bg.bm.getPixelRGB(where.x, where.y, rgb, true);

      var lumaComponent = this.A.temperatureRange.convertPoint(rgb.l, this.A.worldColorRange);

      var darkness = this.darkness.alpha;
      var darknessComponent = this.A.temperatureRange.convertPoint(darkness, this.A.darknessRange);

      var yAxisComponent = this.A.temperatureRange.convertPoint(where.y, this.A.yAxisRange);

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (yAxisComponent + 10 * (lumaComponent + darknessComponent)) / 21;

      return final;
    },
    
    getWorldColorRange: function() {
      var rgb = {};

      this.A.bg.bm.getPixelRGB(this.A.gameRadius, 10, rgb, true);
      var lumaTL = rgb.l;

      this.A.bg.bm.getPixelRGB(
        Math.floor(this.A.gameRadius), Math.floor(this.A.gameHeight - 10), rgb, true
      );
      var lumaBR = rgb.l;

      // Bottom right is the cold end, top left is the hot
      return new Archotype.Range(lumaBR, lumaTL);
    },
    
    ignite: function() {
      this.darkness = this.A.game.add.sprite(this.A.gameCenter.x, this.A.gameCenter.y, this.A.game.cache.getBitmapData('archoniaGoo'));

      var scale = this.A.gameWidth / this.A.archoniaGooRadius;
      this.darkness.scale.setTo(scale, scale); // Big enough to cover the world

      this.darkness.anchor.setTo(0.5, 0.5);
      this.darkness.alpha = this.A.darknessAlphaHi; // Note: dark sprite, so high alpha means dark world
      this.darkness.tint = 0x9900;

      this.darknessTween = this.A.game.add.tween(this.darkness).to(
        {alpha: this.A.darknessAlphaLo}, this.A.dayLength, easingFunction, true, 0, -1, true
      );
  
      this.dayNumber = 1;
  
      /*this.darknessTween.onLoop.add(function() {
        this.A.archonia.archons.dailyReport(this.dayNumber++);
      }, this);*/
    }
  };
})();

if(typeof window === "undefined") {
  module.exports = Archotype.Sun;
}
