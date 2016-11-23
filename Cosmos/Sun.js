/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser, tinycolor */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {
  
  var tempSwingRange = new Archonia.Form.Range(0, 500);
  var skyHueSwingRange = new Archonia.Form.Range(0, 180);
  var currentSeasonMaxTempMagnitude = Archonia.Axioms.temperatureHi;
  
  var Year = function() {
    // Start the year in some random month, just for fun --
    // because the rest of this project is so serious
    this.skyHue = Archonia.Axioms.integerInRange(0, 360);
    
    this.season = Archonia.Engine.game.add.sprite(
      Archonia.Essence.gameCenter.x, Archonia.Essence.gameCenter.y,
      Archonia.Engine.game.cache.getBitmapData('archoniaSeasons')
    );
    
    this.season.scale.setTo(1, 1);
    this.season.anchor.setTo(0.5, 0.5);
    this.season.alpha = 0.1;
    this.season.visible = true;
  };
  
  Year.prototype = {
    skyHue: 0,
    
    setSeason: function() {
      var k = Math.floor(this.skyHue);
      var s = "hsl(" + k +  ", 100%, 50%)";
      var t = tinycolor(s);
      var h = t.toHex(false);
      
      this.season.tint = parseInt(h, 16);
      
      var n = Math.abs(k - 180);
      var r = tempSwingRange.convertPoint(n, skyHueSwingRange);

      currentSeasonMaxTempMagnitude = Archonia.Axioms.temperatureHi - r;
    },
    
    tick: function() { this.skyHue = (this.skyHue + 360 / Archonia.Axioms.daysPerYear) % 360; this.setSeason(); }
  };
  
  var Day = function(noonBells, theSun) {
    var x = Archonia.Essence.gameCenter.x, y = Archonia.Essence.gameCenter.y;
    var b = Archonia.Engine.game.cache.getBitmapData('archoniaGooArchonia');
    this.darkness = Archonia.Engine.game.add.sprite(x, y, b);

    var scale = Archonia.Axioms.gameWidth / Archonia.Axioms.gooRadiusArchonia;
    this.darkness.scale.setTo(scale, scale); // Big enough to cover the world

    this.darkness.anchor.setTo(0.5, 0.5);
    this.darkness.alpha = Archonia.Axioms.darknessAlphaLo; // Note: dark sprite, so high alpha means dark world
    this.darkness.tint = 0;
    
    this.darkness.visible = true;

    this.darknessTween = Archonia.Engine.game.add.tween(this.darkness).to(
      {alpha: Archonia.Axioms.darknessAlphaHi}, Archonia.Axioms.dayLength, Phaser.Easing.Quartic.InOut, true, 0, -1, true
    );

    this.darknessTween.onLoop.add(noonBells, theSun);
  };
  
  Day.prototype = {
    rawBrightnessRange: null,
    darkness: null,
    darknessTween: null,
    dayNumber: null
  };
  
  var Sun = function() {
    this.rawBrightnessRange = new Archonia.Form.Range(-1, 1);
    this.seasonalBrightnessRange = new Archonia.Form.Range(-1, 1);

    // Note: add day/season sprites AFTER the desert, so
    // they'll come out on top in the z-order
    this.year = new Year();
    this.day = new Day(this.noonBells, this);
  };
  
  Sun.prototype = {
    halfDayNumber: 0,
    
    getEnergyLevel: function() {
      var level = this.rawBrightnessRange.convertPoint(this.day.darkness.alpha, Archonia.Essence.oneToZeroRange);
      return level * currentSeasonMaxTempMagnitude;
    },
    
    noonBells: function() {
      this.halfDayNumber++;

      if(this.halfDayNumber % 2 === 1) {
        this.year.tick();
      }
    }
  };
  
  Archonia.Cosmos.TheSun = { ignite: function() { Archonia.Cosmos.TheSun = new Sun(); } };
})(Archonia);
