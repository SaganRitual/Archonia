/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

var contrastScale = 10;
var contrastExponent = 2;

var normalizeCurve = function(curve) {
  var chop = function(curve) {
    var min = getMin(curve);
    for(var i = 0; i < curve.length; i++) {
      if(curve[i] !== null) {
        curve[i] -= min;
        if(curve[i] < 1e-6) { curve[i] = 0; }
      }
    }
  };
  
  var contrastify = function(curve) {
    var max = getMax(curve);
    for(var i = 0; i < curve.length; i++) {
      if(curve[i] !== null) {
        curve[i] = Math.pow(curve[i], contrastExponent) / Math.pow(max, contrastExponent - 1);
      }
    }
  };
  
  var getMax = function(curve) {
    for(var i = 0, max = null; i < curve.length; i++) {
      var weight = curve[i];
      if(weight > 0 && (max === null || weight > max)) { max = weight; }
    }
    
    return max;
  };

  var getMin = function(curve) {
    for(var i = 0, min = null; i < curve.length; i++) {
      var weight = curve[i];
      if(weight > 0 && (min === null || weight < min)) { min = weight; }
    }

    return min;
  };
  
  var scale = function(curve) {
    var i = null;
    
    if(signalIsFlat(curve)) {
      // If the signal is flat, it's possible all the points are at zero.
      // We need to set all the non-nulls to 1 so our selector will get a random
      // one, instead of just grabbing the first element every time
      for(i = 0; i < curve.length; i++) {
        if(curve[i] !== null) { curve[i] = 1; }
      }
    } else {
      // Note: if the signal is not flat, then max can't be zero; divide is ok
      var max = getMax(curve);
      for(i = 0; i < curve.length; i++) {
        if(curve[i] !== null) { curve[i] *= contrastScale / max; }
      }
    }
  };
  
  var signalIsFlat = function(curve) {
    var first = curve.find(function(e) { return e !== null; });
    
    // Didn't find any non-null value; that counts as flat
    if(first === undefined) { return true; }
    
    // Found non-null; it's flat iff all the non-null values are the same
    else { var f = curve.findIndex(function(e) { return e !== first && e !== null; }) === -1; return f;}
  };
  
  chop(curve);
  scale(curve);
  contrastify(curve);
  
  return curve;
};

Archonia.Essence.normalizeCurve = normalizeCurve;

})(Archonia);

