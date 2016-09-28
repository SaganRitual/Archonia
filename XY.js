/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var A = A || {};

(function(A) {

A.XY = function(sourceOrMaybeX, maybeY) {
  if(this instanceof A.XY) {
    this.set(sourceOrMaybeX, maybeY);
  } else {
    return new A.XY(sourceOrMaybeX, maybeY);
  }
};

A.XY.prototype = {
  add: function(a1, a2) { var addend = A.XY(a1, a2); this.x += addend.x; this.y += addend.y; },
  
  dividedByScalar: function(scalar) { var scratch = A.XY(this); scratch.scalarDivide(scalar); return scratch; },
  
  equals: function(a1, a2) { var rhs = A.XY(a1, a2); return this.x === rhs.x && this.y === rhs.y; },
  
  floor: function() { this.x = Math.floor(this.x); this.y = Math.floor(this.y); },
  
  floored: function() { var scratch = A.XY(this); scratch.floor(); return scratch; },
  
  getAngleFrom: function(a1, a2) { var c = A.XY(a1, a2); return Math.atan2(this.y - c.y, this.x - c.x); },

  getAngleTo: function(a1, a2) { var c = A.XY(a1, a2); return c.getAngleFrom(this); },
  
  getDistanceTo: function(a1, a2) { return getMagnitude(this.minus(a1, a2)); },
  
  getMagnitude: function() { return getMagnitude(this); },
  
  getSign: function() { return getSign(this.x, this.y); },

  getSignedMagnitude: function() { return this.getMagnitude() * this.getSign(); },
  
  plus: function(a1, a2) { var scratch = A.XY(this); scratch.add(a1, a2); return scratch; },
  
  minus: function(a1, a2) { var scratch = A.XY(this); scratch.subtract(a1, a2); return scratch; },
  
  normalize: function() { var s = this.getMagnitude(); if(s !== 0) { this.x /= s; this.y /= s; } },
  
  normalized: function() { var scratch = A.XY(this); scratch.normalize(); return scratch; },
  
  reset: function() { this.set(0, 0); },
  
  scalarDivide: function(scalar) { this.x /= scalar; this.y /= scalar; },
  
  scalarMultiply: function(scalar) { this.x *= scalar; this.y *= scalar; },
  
  scaleTo: function(a1, a2) {
    var scratch = A.XY(a1, a2);
    var mS = scratch.getMagnitude();
    var mThis = this.getMagnitude();
    this.scalarMultiply(mS / mThis);
  },
  
  scaledTo: function(a1, a2) { var scratch = A.XY(this); scratch.scaleTo(a1, a2); return scratch; },
  
  setByMagnitude: function(magnitude) { var a = magnitude / Math.sqrt(2); this.x = a; this.y = a; },
  
  subtract: function(a1, a2) { var subtrahend = A.XY(a1, a2); this.x -= subtrahend.x; this.y -= subtrahend.y; },
  
  timesScalar: function(scalar) { var scratch = A.XY(this); scratch.scalarMultiply(scalar); return scratch; },
  
  X: function(places) { if(places === undefined) { places = 0; } return this.x.toFixed(places); },
  
  Y: function(places) { if(places === undefined) { places = 0; } return this.y.toFixed(places); },

  set: function(sourceOrMaybeX, maybeY) {
    if(sourceOrMaybeX === undefined) {
      this.x = 0; this.y = 0;
    } else {
      if(sourceOrMaybeX.x === undefined) {
        if(maybeY === undefined) {
          if(isNaN(sourceOrMaybeX || !isFinite(sourceOrMaybeX))) {
            // sourceOrMaybeX appears to be a number, an x-coordinate, but
            // maybeY has nothing in it. Tell the caller we hate him
            throw TypeError("Bad argument");
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

A.XY.fromPolar = function(r, theta) {
  return A.XY(Math.cos(theta) * r, Math.sin(theta) * r);
};

A.XY.fromMagnitude = function(magnitude) {
  return A.XY(magnitude / Math.sqrt(2));
};

A.XY.set = function(target, a1, a2) {
  var scratch = A.XY(a1, a2);

  target.x = scratch.x;
  target.y = scratch.y;
};

A.RandomXY = function() {
  this.min = A.XY();
  this.max = A.XY();
  this.point = A.XY();
};

A.RandomXY.prototype = {
  random: function() {
    var x = A.integerInRange(this.min.x, this.max.x);
    var y = A.integerInRange(this.min.y, this.max.y);
    this.point.set(x, y);
    return this.point;
  },
  
  setMin: function(minX, minY) { this.min.set(minX, minY); },
  setMax: function(maxX, maxY) { this.max.set(maxX, maxY); }
};

function getMagnitude(a1, a2) {
  var xy = A.XY(a1, a2);
  
  return Math.sqrt(Math.pow(xy.x, 2) + Math.pow(xy.y, 2));
}

function getSign(a1, a2) {
  var xy = A.XY(a1, a2);

  if(xy.x === 0) { return Math.sign(xy.y); }
  else if(xy.y === 0) { return Math.sign(xy.x); }
  else { return Math.sign(xy.x) * Math.sign(xy.y); }
}

})(A);

if(typeof window === "undefined") {
  module.exports = A.XY;
}
