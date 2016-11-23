/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Axioms = require("../Axioms.js");
  Archonia.Essence = require("../Essence.js");
}

(function(Archonia) {

Archonia.Form.Range = function(lo, hi) {
  if(lo === undefined || hi === undefined || isNaN(lo) || isNaN(hi)) {
    Archonia.Essence.hurl(new Error("Bad arguments to Range()"));
  }

  this.lo = lo; this.hi = hi;
  
  this.radialRange = null;
};

Archonia.Form.Range.prototype = {
  // The reason for this class: scaling a point
  // in my range to a point in a different range
  convertPoint: function(thePointOnHisMap, hisRange) {
    if(
      thePointOnHisMap === undefined || isNaN(thePointOnHisMap) ||
      hisRange === undefined || !(hisRange instanceof Archonia.Form.Range)
    ) { Archonia.Essence.hurl(new Error("Bad arguments to convertPoint()")); }

    // This is a signed value, indicating both his distance
    // and direction from his center; if it's a negative
    // value, then he's to the negative side of his center
    var hisDistanceFromCenter = thePointOnHisMap - hisRange.getCenter();

    // But if he's a hi to lo range, then we need to flip
    // the sign, unless, of course, we both are
    var signAdjust = this.getSign() * hisRange.getSign();

    var asAPercentage = signAdjust * hisDistanceFromCenter / hisRange.getSize();
    var relativeToMyScale = this.getSize() * asAPercentage;
    var absoluteOnMyScale = this.getCenter() + relativeToMyScale;

    return absoluteOnMyScale;
  },

  getCenter: function() {
    var base = (this.lo < this.hi) ? this.lo : this.hi;
    return base + this.getSize() / 2;
  },
  
  getRadius: function() {
    return this.radial().getSize();
  },

  getSign: function() {
    return Math.sign(this.hi - this.lo) || 1;
  },

  getSize: function() {
    return Math.abs(this.hi - this.lo);
  },
  
  radial: function() {
    if(this.radialRange === null) {
      this.radialRange = new Archonia.Form.Range(0, Math.abs(this.hi - this.lo) / 2);
    }
    
    return this.radialRange;
  },

  set: function(lo, hi) {
    this.lo = lo;
    this.hi = hi;
    return this;
  }
};
  
})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Range;
}
