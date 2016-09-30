/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var U = U || {};

(function(U) {

  U.Rounder = function(howManyElements) {
    if(howManyElements === 0) { throw new ReferenceError("Can't store in zero-length rounder"); }

    this.elements = [];
    this.howManyElements = howManyElements;
    this.indexForNextElement = 0;
  };
  
  U.Rounder.prototype = {
    
    deepForEach: function(callback, context) {
      if(context === undefined) { context = this; }

      this.forEach(function(ix) {
        if(callback(ix, this.elements) === false) { return false; }
      }, context);
    },
    
    forEach: function(callback, context) {
      if(context === undefined) { context = this; }
      
      var ix = (this.elements.length === this.howManyElements) ? this.indexForNextElement : 0;
      
      for(var i = 0; i < this.elements.length; i++) {
        var valueToPass = this.elements[ix];

        if(callback.call(context, ix, valueToPass) === false) { return false; }

        ix = (ix + 1) % this.elements.length;
      }
    },
    
    store: function(valueToStore) {
      if(this.elements.length < this.howManyElements) {
        this.elements.push(valueToStore);
      } else {
        this.elements[this.indexForNextElement] = valueToStore;
      }

      this.indexForNextElement = (this.indexForNextElement + 1) % this.howManyElements;
    }
    
  };
  
})(U);


if(typeof window === "undefined") {
  module.exports = U;
}