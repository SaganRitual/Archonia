/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

/* global Phaser */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };
var tinycolor = tinycolor || {};

(function(Archonia) {

var TweenColor = function(sprite, hslString) {
  this.sprite = sprite;
  this.tweening = false;

  this.tinycolor = new tinycolor(hslString);

  // this is mostly just for getting default sat
  // setting. It stays the same while the hue & luma vary
  var m = hslString.match(/(\d+)/g);
  this.h = m[0]; this.s = m[1]; this.L = m[2];
};

TweenColor.prototype = {
  tick: function() {
    this.hslString = "hsl(" + Math.floor(this.h) + ", " + Math.floor(this.s) + "%, " + Math.floor(this.L) + "%)";
    this.sprite.tint = parseInt(this.tinycolor.fromHsl(this.hslString).toHex(), 16);
  }
};

var TweenColorVent = function(sprite, hslString) {
  TweenColor.call(this, sprite, hslString);
  
  this.hueTween = null;
  this.lumaTween = null;
  this.hueQueue = [ ];

  this.targetHue = this.h;

  this.startLumaPulse();
};

TweenColorVent.prototype = Object.create(TweenColor.prototype);
TweenColorVent.prototype.constructor = TweenColor;

TweenColorVent.prototype.setHue = function(hueValue) {
  // Tick calls us with no parameter; this is to tell us to check for new
  // hue in the queue and start another tween going if it's time to do so.
  // The class client will call us with a value; we'll store that in the
  // queue, to be retrieved when any currently active tween is finished
  if(hueValue !== undefined && hueValue !== this.targetHue && this.hueQueue.indexOf(hueValue) === -1) {
    this.hueQueue.push(hueValue);
  }

  if(this.hueTween === null && this.hueQueue.length > 0) {
    this.targetHue = this.hueQueue.shift();
    
    this.hueTween = Archonia.Engine.game.add.tween(this).to(
      { h: this.targetHue }, 2 * 1000, Phaser.Easing.Sinusoidal.In, true, 0, 0, false
    );

    this.hueTween.onComplete.add(function(thisTweenColorObject) {
      thisTweenColorObject.h = thisTweenColorObject.targetHue; thisTweenColorObject.hueTween = null;
    });
  }
};

TweenColorVent.prototype.startLumaPulse = function() {
  this.lumaTween = Archonia.Engine.game.add.tween(this).to(
    { L: 25 }, 5 * 1000, Phaser.Easing.Quartic.InOut, true, 0, -1, true
  );
};
  
TweenColorVent.prototype.tick = function() {
  this.setHue(); 
  Object.getPrototypeOf(TweenColorVent.prototype).tick.call(this);
};

var TweenColorButton = function(sprite, hslString) {
  TweenColor.call(this, sprite, hslString);
  this.tween = null;
};

TweenColorButton.prototype = Object.create(TweenColor.prototype);
TweenColorButton.prototype.constructor = TweenColor;

TweenColorButton.prototype.onComplete = function(_this) { _this.tweening = false; };
  
TweenColorButton.prototype.set = function(hue) { this.h = Math.floor(hue); this.stop(); };
  
TweenColorButton.prototype.start = function(hue1, hue2) {
  if(!this.tweening) {
    this.h = Math.floor(hue1);
    
    this.tween = Archonia.Engine.game.add.tween(this).to(
        { h: Math.floor(hue2) }, 0.5 * 1000, Phaser.Easing.Sinusoidal.InOut, true, 0, -1, true
      );

    this.tween.onComplete.add(this.onComplete);

    this.tweening = true;
  }
};
  
TweenColorButton.prototype.stop = function() { if(this.tweening) { this.tween.stop(); this.tweening = false; } };

var TweenColorDragonfly = function(sprite, hslString) {
  TweenColor.call(this, sprite, hslString);
  
  this.hueTween = null;

  this.startHuePulse();
};

TweenColorDragonfly.prototype = Object.create(TweenColor.prototype);
TweenColorDragonfly.prototype.constructor = TweenColor;

TweenColorDragonfly.prototype.startHuePulse = function() {
  this.hueTween = Archonia.Engine.game.add.tween(this).to(
    { h: 240 }, 5 * 1000, Phaser.Easing.Quartic.InOut, true, 0, -1, true
  );
};
  
TweenColorDragonfly.prototype.tick = function() {
  Object.getPrototypeOf(TweenColorDragonfly.prototype).tick.call(this);
};
  
Archonia.Engine.TweenColorVent = TweenColorVent;
Archonia.Engine.TweenColorButton = TweenColorButton;
Archonia.Engine.TweenColorDragonfly = TweenColorDragonfly;

})(Archonia);

