/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var U = U || {};

(function(U) {
  
    U.Rounder = function(howManyElements) {
    if(howManyElements === 0) { throw new ReferenceError("Can't store in zero-length rounder"); }

    this.reset();
    this.howManyElements = howManyElements;
  };
  
  U.Rounder.prototype = {
    add: function(index, howMany) {
      if(this.elements.length === 0) { throw new ReferenceError("plus() can't work with an empty Rounder"); }
      return (index + howMany + this.elements.length) % this.elements.length;
    },

    advance: function(howMany) {
      if(howMany === undefined) { howMany = 1; }
      
      // Note the difference between this function and add(). To advance, we go
      // forward until the array is filled, then we circle back. The add() function
      // cares about how many elements are actually in the array
      this.indexForNextElement = (this.indexForNextElement + 1) % this.howManyElements;
    },
    
    deepForEach: function(callback, context) {
      if(context === undefined) { context = this; }

      this.forEach(function(ix) {
        if(callback.call(context, ix, this.elements) === false) { return false; }
      }, this); // Obviously we need to pass 'this' -- so much to learn still about js
    },
    
    forEach: function(callback, context) {
      if(context === undefined) { context = this; }
      
      var ix = this.getIndexOfOldestElement();
      
      for(var i = 0; i < this.elements.length; i++) {
        var valueToPass = this.elements[ix];

        if(callback.call(context, ix, valueToPass) === false) { return false; }

        ix = this.add(ix, 1);
      }
    },
    
    getIndexOfNewestElement: function() {
      if(this.elements.length === 0) { throw new ReferenceError("getIndexOfNewestElement() can't work with an empty Rounder"); }
      return (this.indexForNextElement + this.elements.length - 1) % this.elements.length;
    },
    
    getIndexOfOldestElement: function() {
      if(this.elements.length === 0) { throw new ReferenceError("getIndexOfOldestElement() can't work with an empty Rounder"); }
      return (this.elements.length === this.howManyElements) ? this.indexForNextElement : 0;
    },
    
    reset: function() {
      this.indexForNextElement = 0;
      this.elements = [];
    },
  
    slice: function(start, howMany) {
      if(start === 0) {
        // Start of zero means start at the oldest entry; only check is whether
        // caller is asking for too many entries
        if(howMany > this.elements.length) { throw new ReferenceError("Bad arguments"); }
      } else {
        if(start + howMany > 0 || Math.abs(start) > this.elements.length) { throw new ReferenceError("Bad arguments"); }
        if(howMany > this.elements.length) { throw new ReferenceError("Bad arguments"); }
        if(start >= 0) { throw new ReferenceError("Bad arguments"); }
      }
      
      var ix = null;
      
      if(start === 0) {
        ix = this.getIndexOfOldestElement();
      } else {
        var s = this.getIndexOfNewestElement();
        ix = this.add(s, start + 1);
      }
      
      var slice = [];
      for(var i = 0; i < howMany; i++) {
        slice.push(this.elements[ix]);
        ix = this.add(ix, 1);
      }
      
      return slice;
    },
    
    store: function(valueToStore) {
      if(this.elements.length < this.howManyElements) {
        this.elements.push(valueToStore);
      } else {
        this.elements[this.indexForNextElement] = valueToStore;
      }
      
      this.advance();
    }

  };
  
})(U);


if(typeof window === "undefined") {
  module.exports = U;
}