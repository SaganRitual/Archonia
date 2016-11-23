/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === 'undefined') {
  Archonia.Axioms = require('../Axioms.js');
  Archonia.Essence = require('../Essence.js');
}

(function(Archonia) {
  
  Archonia.Form.Cbuffer = function(howManyElements) {
    if(howManyElements === 0) { Archonia.Essence.hurl(new Archonia.Essence.BirthDefect("Zero-length Cbuffer")); }

    this.archoniaUniqueObjectId = Archonia.Essence.archoniaUniqueObjectId++;
    this.reset();
    this.howManyElements = howManyElements;
  };
  
  Archonia.Form.Cbuffer.prototype = {
    add: function(index, howMany) {
      if(this.elements.length === 0) { Archonia.Essence.hurl(new Error("plus() can't work with an empty Cbuffer")); }
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

        if(callback.call(context, ix, valueToPass) === false) { return ix; }

        ix = this.add(ix, 1);
      }
    },
    
    getElementAt: function(ix) { ix = this.add(ix, 0); return this.elements[ix]; },
    
    getIndexOfNewestElement: function() {
      if(this.elements.length === 0) { Archonia.Essence.hurl(new Error("getIndexOfNewestElement() can't work with an empty Cbuffer")); }
      return (this.indexForNextElement + this.elements.length - 1) % this.elements.length;
    },
    
    getIndexOfOldestElement: function() {
      if(this.elements.length === 0) { Archonia.Essence.hurl(new Error("getIndexOfOldestElement() can't work with an empty Cbuffer")); }
      return (this.elements.length === this.howManyElements) ? this.indexForNextElement : 0;
    },
    
    getSpreadAt: function(index, spread) {
      if(this.elements.length < spread) { console.log("Warning: array smaller than spread size"); }
      
      // We want to return an index that is in the middle of the
      // spread. If the spread is even, randomly choose one or the
      // other element. If odd, just choose the center
      var center = Math.floor(spread / 2);

      if(spread % 2 === 0) {
        center += Archonia.Axioms.integerInRange(-1, 0);
      }
    
      var result = [];
      for(var i = 0; i < spread; i++) {
        var ix = this.add(index, i - center);
        result.push(this.elements[ix]);
      }
      
      return result;
    },
    
    isEmpty: function() {
      return this.empty;
    },
    
    isFull: function() {
      return this.elements.length === this.howManyElements;
    },
    
    reset: function() {
      this.empty = true;
      this.indexForNextElement = 0;
      this.elements = [];
    },
  
    slice: function(start, howMany) {
      if(this.elements.length === 0) { Archonia.Essence.hurl(new Error("Bad arguments to slice()")); }
      var ix = null;
      
      if(start >= 0) {
        ix = this.getIndexOfOldestElement();
      } else {
        ix = this.getIndexOfNewestElement();
        ix = this.add(ix, 1);
      }
      
      ix = this.add(ix, start);

      var slice = [];
      for(var i = 0; i < howMany; i++) {
        slice.push(this.elements[ix]);
        ix = this.add(ix, 1);
      }
      
      return slice;
    },
    
    store: function(valueToStore) {
      this.empty = false;
      if(this.elements.length < this.howManyElements) {
        this.elements.push(valueToStore);
      } else {
        this.elements[this.indexForNextElement] = valueToStore;
      }
      
      this.advance();
    }

  };
  
})(Archonia);


if(typeof window === "undefined") {
  module.exports = Archonia.Form.Cbuffer;
}