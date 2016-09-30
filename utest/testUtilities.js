var A = {};

var chai = require('chai');

describe('Utilities', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { A.Utilities = require('../Utilities.js'); }
      chai.expect(c).to.not.throw();
      chai.expect(A.Utilities).to.have.property('Rounder');
    });
    
    describe('#functions exist', function() {
      it('#forEach()', function() {
        var r = new A.Utilities.Rounder(10);
        chai.expect(r).to.have.property('forEach');
        chai.assert.typeOf(r.forEach, 'Function');
      });
      
      it('#store()', function() {
        var r = new A.Utilities.Rounder(10);
        chai.expect(r).to.have.property('store');
        chai.assert.typeOf(r.store, 'Function');
      });
      
      it('#deepForEach()', function() {
        var r = new A.Utilities.Rounder(10);
        chai.expect(r).to.have.property('deepForEach');
        chai.assert.typeOf(r.deepForEach, 'Function');
      });
    });
  });
  
  describe('Functionality', function() {
    describe('#forEach()', function() {
      it('#iterating callback, proper roundering, various array sizes', function() {
        for(var fillCount = 1; fillCount < 10; fillCount++) {

          var tracker = 0;

          for(var arraySize = 1; arraySize < 10; arraySize++) {

            var r = null;
          
            var s = function() { r = new A.Utilities.Rounder(arraySize); };
          
            chai.expect(s).to.not.throw();

            var total = 0;
      
            for(var i = 0; i < arraySize * fillCount; i++) { r.store(i); }
      
            r.forEach(function(ix, value) {
              total += value;
            }, this);
    
            var expected = 0;
            var a = arraySize * (fillCount - 1), b = a;

            for(var i = 0; i < arraySize; i++) { expected += b + i; }
    
            chai.expect(total).equal(expected);

            tracker = total - a;

            total = 0;

            r.store(42);
            r.forEach(function(ix, value) {
              total += value;
            }, this);
        

            chai.expect(total).equal(tracker + 42);
        
          }
        }
      });
      
      it('#quit loop if callback returns false', function() {
        var r = new A.Utilities.Rounder(10);
        var total = 0;

        for(var i = 0; i < 5; i++) { r.store(i); }
        r.forEach(function(ix, value) { total += value; return false; });
        
        chai.expect(total).equal(0);
      });
    });
    describe('#deepForEach()', function() {
      it('#change internal values', function() {
        var r = new A.Utilities.Rounder(10);
        
        for(var i = 0; i < 10; i++) { r.store(42); }
        
        var total = 0;
        r.forEach(function(ix, value) { total += value; });
        
        chai.expect(total).equal(42 * 10);
        
        r.deepForEach(function(ix, array) { array[ix] -= 5; });

        var total = 0;
        r.forEach(function(ix, value) { total += value; });
        
        chai.expect(total).equal((42 - 5) * 10);
      });
      
      it('#quit loop if callback returns false', function() {
        var r = new A.Utilities.Rounder(10);
        
        for(var i = 0; i < 10; i++) { r.store(42); }
        
        r.deepForEach(function(ix, array) { array[ix] -= 5; return false; });
        
        var total = 0;
        r.forEach(function(ix, value) { total += value; });
        chai.expect(total).equal((42 * 10) - 5);
      });
    });

    describe('#store()', function() {
      it('#stores values, tracks index', function() {
        var r = new A.Utilities.Rounder(2);
        
        r.store(42);
        chai.expect(r.elements.length).equal(1);
        chai.expect(r.indexForNextElement = 1);
        chai.expect(r.elements[0]).equal(42);
        
        r.store(137);
        chai.expect(r.elements.length).equal(2);
        chai.expect(r.indexForNextElement = 0);
        chai.expect(r.elements[1]).equal(137);
        
        r.store(1066);
        chai.expect(r.elements.length).equal(2);
        chai.expect(r.indexForNextElement = 1);
        chai.expect(r.elements[0]).equal(1066);
      });
      
      it('#tracks on arrays larger than two elements', function() {
        var r = new A.Utilities.Rounder(17);
        
        for(var i = 0; i < 17; i++) { r.store(i); }

        chai.expect(r.elements.length).equal(17);
        chai.expect(r.indexForNextElement = 0);
        chai.expect(r.elements[0]).equal(0);
        chai.expect(r.elements[5]).equal(5);
        chai.expect(r.elements[16]).equal(16);
        
        r.store(132);
        chai.expect(r.elements[0]).equal(132);
      });
    });
  });
});
