/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require("../Axioms.js");
  Archonia.Essence = require("../Essence.js");
}

(function(Archonia) {
  
  var sscratch = null, sscratch2 = null;
  
Archonia.Form.XY = function(sourceOrMaybeX, maybeY) {
  if(this instanceof Archonia.Form.XY) {
    this.set(sourceOrMaybeX, maybeY);
  } else {
    return new Archonia.Form.XY(sourceOrMaybeX, maybeY);
  }
};

Archonia.Form.XY.prototype = {
  add: function(a1, a2) { rp(a1, a2); sscratch.set(a1, a2); this.x += sscratch.x; this.y += sscratch.y; },
  
  capMagnitude: function(scalar) { if(this.getMagnitude() > scalar) { this.normalize(); this.scalarMultiply(scalar); } },
  
  dividedByScalar: function(scalar) { var scratch = Archonia.Form.XY(this); scratch.scalarDivide(scalar); return scratch; },
  
  equals: function(a1, a2) { rp(a1, a2); sscratch.set(a1, a2); return this.x === sscratch.x && this.y === sscratch.y; },
  
  floor: function() { this.x = Math.floor(this.x); this.y = Math.floor(this.y); },
  
  floored: function() { var scratch = Archonia.Form.XY(this); scratch.floor(); return scratch; },
  
  fuzzyEqual: function(rhs, tolerance) {
    return Archonia.Axioms.fuzzyEqual(this.x, rhs.x, tolerance) && Archonia.Axioms.fuzzyEqual(this.y, rhs.y, tolerance);
  },
  
  getAngleFrom: function(a1, a2) { rp(a1, a2); sscratch.set(a1, a2); return Math.atan2(this.y - sscratch.y, this.x - sscratch.x); },

  getAngleTo: function(a1, a2) { rp(a1, a2); sscratch2.set(a1, a2); return sscratch2.getAngleFrom(this); },
  
  getDistanceTo: function(a1, a2) { rp(a1, a2); return getMagnitude(this.minus(a1, a2)); },
  
  getMagnitude: function() { return getMagnitude(this); },
  
  getSign: function() { return getSign(this.x, this.y); },

  getSignedMagnitude: function() { return this.getMagnitude() * this.getSign(); },
  
  isInBounds: function() {
    return(
      this.y > Archonia.Axioms.goddamnedTop && this.x < Archonia.Axioms.goddamnedRight &&
      this.y < Archonia.Axioms.goddamnedBottom && this.x > Archonia.Axioms.goddamnedLeft
    );
  },
  
  plus: function(a1, a2) { var scratch = Archonia.Form.XY(this); scratch.add(a1, a2); return scratch; },
  
  minus: function(a1, a2) { var scratch = Archonia.Form.XY(this); scratch.subtract(a1, a2); return scratch; },
  
  normalize: function() { var s = this.getMagnitude(); if(s !== 0) { this.x /= s; this.y /= s; } },
  
  normalized: function() { var scratch = Archonia.Form.XY(this); scratch.normalize(); return scratch; },
  
  randomizedTo: function(a1, a2) {
    var r = Archonia.Form.XY(a1, a2);
    var scratch = Archonia.Form.XY(this);
    scratch.x = Archonia.Axioms.integerInRange(scratch.x - r.x / 2, scratch.x + r.x / 2);
    scratch.y = Archonia.Axioms.integerInRange(scratch.y - r.y / 2, scratch.y + r.y / 2);
    return scratch;
  },
  
  reset: function() { this.set(0, 0); },
  
  setPolar: function(r, theta) { this.x = r * Math.cos(theta); this.y = r * Math.sin(theta); return this; },
  
  scalarDivide: function(scalar) { rp(scalar); this.x /= scalar; this.y /= scalar; },
  
  scalarMultiply: function(scalar) { rp(scalar); this.x *= scalar; this.y *= scalar; },
  
  scaleTo: function(a1, a2) {
    rp(a1, a2);
    var scratch = Archonia.Form.XY(a1, a2);
    var mS = scratch.getMagnitude();
    var mThis = this.getMagnitude();
    this.scalarMultiply(mS / mThis);
  },
  
  scaledTo: function(a1, a2) { var scratch = Archonia.Form.XY(this); scratch.scaleTo(a1, a2); return scratch; },
  
  setByMagnitude: function(magnitude) { rp(magnitude); var a = magnitude / Math.sqrt(2); this.x = a; this.y = a; },
  
  subtract: function(a1, a2) { rp(a1, a2); sscratch.set(a1, a2); this.x -= sscratch.x; this.y -= sscratch.y; },
  
  timesScalar: function(scalar) { rp(scalar); var scratch = Archonia.Form.XY(this); scratch.scalarMultiply(scalar); return scratch; },

  toString: function(places) { return "(" + this.X(places) + ", " + this.Y(places) + ")"; },
  
  X: function(places) { if(places === undefined) { places = 0; } return this.x.toFixed(places); },
  
  Y: function(places) { if(places === undefined) { places = 0; } return this.y.toFixed(places); },

  set: function(sourceOrMaybeX, maybeY) {
    if(sourceOrMaybeX instanceof Archonia.Form.XY) {
      this.x = sourceOrMaybeX.x; this.y = sourceOrMaybeX.y;
    } else if(sourceOrMaybeX === undefined) {
      this.x = 0; this.y = 0;
    } else {
      if(sourceOrMaybeX.x === undefined) {
        if(maybeY === undefined) {
          if(isNaN(sourceOrMaybeX || !isFinite(sourceOrMaybeX))) {
            // sourceOrMaybeX appears to be a number, an x-coordinate, but
            // maybeY has nothing in it. Tell the caller we hate him
            throw Error("Bad arguments to XY()");
          } else {
            // Single number specified, take it as the value for both
            this.x = sourceOrMaybeX;
            this.y = sourceOrMaybeX;
          }
        } else {
          // Looks like an x/y pair
          this.x = sourceOrMaybeX;
          this.y = maybeY;
        }
      } else {
        // sourceOrMaybeX must be an object with x/y values
        this.x = sourceOrMaybeX.x;
        this.y = sourceOrMaybeX.y;
      }
    }

    return this;
  }
};

Archonia.Form.XY.setSafeScratch = function() {
  sscratch = Archonia.Form.XY();
  sscratch2 = Archonia.Form.XY();
};

Archonia.Form.XY.fromPolar = function(r, theta) {
  return Archonia.Form.XY(Math.cos(theta) * r, Math.sin(theta) * r);
};

Archonia.Form.XY.fromMagnitude = function(magnitude) {
  return Archonia.Form.XY(magnitude / Math.sqrt(2));
};

Archonia.Form.XY.set = function(target, a1, a2) {
  var scratch = Archonia.Form.XY(a1, a2);

  target.x = scratch.x;
  target.y = scratch.y;
};

Archonia.Form.RandomXY = function() {
  this.min = Archonia.Form.XY();
  this.max = Archonia.Form.XY();
  this.point = Archonia.Form.XY();
};

Archonia.Form.RandomXY.prototype = {
  random: function() {
    var x = Archonia.Axioms.integerInRange(this.min.x, this.max.x);
    var y = Archonia.Axioms.integerInRange(this.min.y, this.max.y);
    return this.point.set(x, y);
  },
  
  setMin: function(minX, minY) {
    if(minX === undefined || minY === undefined) { Archonia.Essence.hurl(new Error("Bad arguments to setMin()")); }
    else { this.min.set(minX, minY); }
  },
  
  setMax: function(maxX, maxY) {
    if(maxX === undefined || maxY === undefined) { Archonia.Essence.hurl(new Error("Bad arguments setMax()")); }
    else { this.max.set(maxX, maxY); }
  }
};

// Although many of our functions are ok with undefined arguments, a number of them are not
function rp(a1) { if(a1 === undefined) { Archonia.Essence.hurl(new Error("Bad arguments to rp()")); } }

function getMagnitude(a1, a2) {
  var xy = Archonia.Form.XY(a1, a2);
  
  return Math.sqrt(Math.pow(xy.x, 2) + Math.pow(xy.y, 2));
}

function getSign(a1, a2) {
  var xy = Archonia.Form.XY(a1, a2);

  if(xy.x === 0) { return Math.sign(xy.y); }
  else if(xy.y === 0) { return Math.sign(xy.x); }
  else { return Math.sign(xy.x) * Math.sign(xy.y); }
}

Archonia.Essence.gameCenter = Archonia.Form.XY(Archonia.Axioms.gameWidth / 2, Archonia.Axioms.gameHeight / 2);

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form;
}
