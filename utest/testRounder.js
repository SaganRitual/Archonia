var A = require('../Archonia.js');

A.prePhaserSetup();

var chai = require('chai');

describe('Utilities', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { A.Rounder = require('../Rounder.js'); }
      chai.expect(c).to.not.throw();
    });
  });
});
  
describe('Rounder', function() {
  describe('#Public functions exist', function() {
    var names = [
      'deepForEach', 'forEach', 'reset', 'slice', 'store'
    ];
    
    for(var n in names) {
      var name = names[n];

      (function(name) {
        it('#' + name + '()', function() {
          var r = new A.Rounder(10);
          chai.expect(r).to.have.property(name);
          chai.assert.typeOf(r[name], 'Function');
        });
      })(name);
    }
  });

  describe('#public properties exist', function() {
    var names = [ 'isEmpty' ];
    
    for(var n in names) {
      var name = names[n];
    
      (function(name) {
        it('#' + name, function() {
          var r = new A.Rounder(1);
          chai.expect(r).to.have.property(name);
          chai.assert.isNotFunction(r[name]);
        });
      })(name);
    }
  });

  describe('#public properties behave', function() {
    it('#empty/not empty', function() {
      var r = new A.Rounder(1);
      chai.assert(r.isEmpty, 'isEmpty should be true');
    
      r.store(1);
      chai.assert(!r.isEmpty, 'isEmpty should be false');

      r.reset();
      chai.assert(r.isEmpty, 'isEmpty should be true');
    });
  });

  describe('#forEach()', function() {
    it('#iterating callback, proper roundering, various array sizes', function() {
      for(var fillCount = 1; fillCount < 10; fillCount++) {

        var tracker = 0;

        for(var arraySize = 1; arraySize < 10; arraySize++) {

          var r = null;
        
          var s = function() { r = new A.Rounder(arraySize); };
        
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
      var r = new A.Rounder(10);
      var total = 0;

      for(var i = 0; i < 5; i++) { r.store(i); }
      r.forEach(function(ix, value) { total += value; return false; });
      
      chai.expect(total).equal(0);
    });
  });
  
  describe('#deepForEach()', function() {
    it('#change internal values', function() {
      var r = new A.Rounder(10);
      
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
      var r = new A.Rounder(10);
      
      for(var i = 0; i < 10; i++) { r.store(42); }
      
      r.deepForEach(function(ix, array) { array[ix] -= 5; return false; });
      
      var total = 0;
      r.forEach(function(ix, value) { total += value; });
      chai.expect(total).equal((42 * 10) - 5);
    });
  });

  describe('#store()', function() {
    it('#stores values, tracks index', function() {
      var r = new A.Rounder(2);
      
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
      var r = new A.Rounder(17);
      
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
  
  describe('#slice()', function() {
    it('#throws appropriately', function() {
      var r = new A.Rounder(5);
      
      var arrayEmpty = function() { r.slice(1, 1); }
      chai.expect(arrayEmpty).to.throw(ReferenceError, "Bad arguments");
    })
    
    it('#returns expected sections of its array', function() {
      var howManyEntries = 10;
      var r = new A.Rounder(howManyEntries);
      
      for(var i = 0; i < howManyEntries; i++) { r.store(i); }
      
      var s = r.slice(-2, 2);
      
      chai.assert.typeOf(s, "Array");
      chai.expect(s).eql([ 8, 9 ]);
      
      s = r.slice(-5, 3); chai.expect(s).eql([ 5, 6, 7 ]);
      
      r.store(42); 
      s = r.slice(-5, 5); chai.expect(s).eql([ 6, 7, 8, 9, 42 ]);
      
      s = r.slice(0, 5); chai.expect(s).eql([ 1, 2, 3, 4, 5 ]);
      
      s = r.slice(1, 1); chai.expect(s).eql([ 2 ]);
      
      s = r.slice(-11, 3); chai.expect(s).eql([ 42, 1, 2 ]);
      
      s = r.slice(-5, 8); chai.expect(s).eql([ 6, 7, 8, 9, 42, 1, 2, 3 ]);
    });
  });
  
  describe('#reset', function() {
    it('#discard internal array, reset index', function() {
      var howManyEntries = 10;
      var r = new A.Rounder(howManyEntries);
      var total = 0;
      
      for(var i = 0; i < howManyEntries; i++) { r.store(i); total += i; }

      var check = 0;
      r.forEach(function(ix, val) { check += val; });
      
      chai.expect(check).equal(total);
      
      check = 0;
      r.reset();
      r.store(42);
      r.forEach(function(ix, val) { check += val; });
      
      chai.expect(check).equal(42);
      chai.expect(function() { r.slice(); }).to.not.throw();
      chai.expect(r.slice(-2, 1)).eql([ 42 ]);
    });
  });
});
