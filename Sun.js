/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global tinycolor */

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

  Archonia.Cosmos.Sea = Archonia.Essence.BitmapFactory.makeBitmap('archoniaGoo');
}

(function(Archonia) {
  
  var tempSwingRange = new Archonia.Form.Range(0, 500);
  var skyHueSwingRange = new Archonia.Form.Range(0, 180);
  
  Archonia.Cosmos.Year = {
    seasonalSkyHue: 0,
    
    setSeason: function() {
      var k = Math.floor(Archonia.Cosmos.Year.seasonalSkyHue);
      var s = "hsl(" + k +  ", 100%, 50%)";
      var t = tinycolor(s);
      var h = t.toHex(false);
      
      Archonia.Cosmos.Year.season.tint = parseInt(h, 16);
      
      var n = null, p = null, q = null, r = null;
      
      n = Math.abs(k - 180);
      r = tempSwingRange.convertPoint(n, skyHueSwingRange);
      p = Archonia.Axioms.temperatureLo + r;
      q = Archonia.Axioms.temperatureHi - r;
      Archonia.Essence.worldTemperatureRange.set(p, q);
    },
    
    start: function() {
      // Start the year in some random month, just for fun --
      // because the rest of this project is so serious
      Archonia.Cosmos.Year.seasonalSkyHue = Archonia.Axioms.integerInRange(0, 360);
      
      Archonia.Cosmos.Year.season = Archonia.Engine.game.add.sprite(
        Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y,
        Archonia.Engine.game.cache.getBitmapData('archoniaSeasons')
      );
      
      Archonia.Cosmos.Year.season.scale.setTo(1, 1);  // could make this bitmap smaller; come back to it
      Archonia.Cosmos.Year.season.anchor.setTo(0.5, 0.5);
      Archonia.Cosmos.Year.season.alpha = 0;
      Archonia.Cosmos.Year.season.visible = true;

      Archonia.Cosmos.Sun.dailyarknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Year.season).to(
        {alpha: 1}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
      );
    },
    
    tick: function() { Archonia.Cosmos.Year.setSeason(); }
  };
  
  Archonia.Cosmos.Sun = {
    darkness: null,
    darknessTween: null,
    dayNumber: null,
    easingFunction: Phaser.Easing.Quartic.InOut,
  
    getStrength: function() {
      // We have to clamp it because the actual sprite alpha can go slightly
      // negative when it's supposed to stop at zero.
      return Archonia.Axioms.clamp(
        Archonia.Essence.zeroToOneRange.convertPoint(Archonia.Cosmos.Sun.darkness.alpha, Archonia.Essence.darknessRange), 0, 1
      );
    },
    
    getTemperature: function(w, wY) {
      if(w === undefined) { Archonia.Axioms.hurl(new Error("Bad arguments to getTemperature()")); }

      var where = Archonia.Form.XY(w, wY).floored();

      var rgb = {};
      Archonia.Cosmos.Sea.bm.getPixelRGB(where.x, where.y, rgb, true);

      var waterDepthComponent =
        Archonia.Essence.worldTemperatureRange.convertPoint(rgb.l, Archonia.Essence.worldColorRange);

      var sunComponent =
        Archonia.Essence.worldTemperatureRange.convertPoint(
          Archonia.Cosmos.Sun.darkness.alpha, Archonia.Essence.darknessRange
        );

      // Give luma and sun most of the weight. The y-axis thing is there
      // just to help them not get stuck in the luma dead zone(s)
      var final = (waterDepthComponent + sunComponent) / 2;

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
      Archonia.Cosmos.Sun.darkness.tint = parseInt(tinycolor('hsl(117, 100%, 65%)').toHex(), 16);
      
      Archonia.Cosmos.Sun.darkness.visible = true;

      Archonia.Cosmos.Sun.darknessTween = Archonia.Engine.game.add.tween(Archonia.Cosmos.Sun.darkness).to(
        {alpha: Archonia.Axioms.darknessAlphaLo}, Archonia.Axioms.dayLength, Archonia.Cosmos.Sun.easingFunction, true, 0, -1, true
      );
  
      Archonia.Cosmos.Sun.halfDayNumber = 0;  // Creation happens at midnight

      Archonia.Essence.worldColorRange = Archonia.Cosmos.Sun.getWorldColorRange();
      
      /*Archonia.Cosmos.Sun.darknessTween.onLoop.add(function() {
        Archonia.Axioms.archonia.archons.dailyReport(this.Archonia.Cosmos.Sun.dayNumber++);
      }, this);*/

      Archonia.Cosmos.Sun.darknessTween.onLoop.add(function() {
        Archonia.Cosmos.Sun.halfDayNumber++;

        if(Archonia.Cosmos.Sun.halfDayNumber % 2 === 0) {
          Archonia.Cosmos.Year.seasonalSkyHue += 360 / Archonia.Axioms.daysPerYear;
          
          if(Archonia.Cosmos.Year.seasonalSkyHue > 360) { Archonia.Cosmos.Year.seasonalSkyHue = 0; }
        }
      });
    }
  };
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Cosmos.Sun;
}
