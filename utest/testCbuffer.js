var A = require('../Archonia.js');

A.prePhaserSetup();

var chai = require('chai');

describe('Cbuffer', function() {
  describe('Smoke test', function() {
    it('#Module exists', function() {
      var c = function() { A.Cbuffer = require('../widgets/Cbuffer.js'); }
      chai.expect(c).to.not.throw();
    });
  });
});
  
describe('Cbuffer', function() {
  describe('#Public functions exist', function() {
    var names = [
      'deepForEach', 'forEach', 'isEmpty', 'getSpreadAt', 'reset', 'slice', 'store'
    ];
    
    for(var n in names) {
      var name = names[n];

      (function(name) {
        it('#' + name + '()', function() {
          var r = new A.Cbuffer(10);
          chai.expect(r).to.have.property(name);
          chai.assert.isFunction(r[name]);
        });
      })(name);
    }
  });

  describe('#isEmpty()', function() {
    it('#empty/not empty', function() {
      var r = new A.Cbuffer(1);
      chai.expect(r.isEmpty()).equal(true);
    
      r.store(1);
      chai.expect(r.isEmpty()).equal(false);

      r.reset();
      chai.expect(r.isEmpty()).equal(true);
    });
  });

  describe('#forEach()', function() {
    it('#iterating callback, proper roundering, various array sizes', function() {
      for(var fillCount = 1; fillCount < 10; fillCount++) {

        var tracker = 0;

        for(var arraySize = 1; arraySize < 10; arraySize++) {

          var r = null;
        
          var s = function() { r = new A.Cbuffer(arraySize); };
        
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
      var r = new A.Cbuffer(10);
      var total = 0;

      for(var i = 0; i < 5; i++) { r.store(i); }
      r.forEach(function(ix, value) { total += value; return false; });
      
      chai.expect(total).equal(0);
    });
  });
  
  describe('#deepForEach()', function() {
    it('#change internal values', function() {
      var r = new A.Cbuffer(10);
      
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
      var r = new A.Cbuffer(10);
      
      for(var i = 0; i < 10; i++) { r.store(42); }
      
      r.deepForEach(function(ix, array) { array[ix] -= 5; return false; });
      
      var total = 0;
      r.forEach(function(ix, value) { total += value; });
      chai.expect(total).equal((42 * 10) - 5);
    });
  });

  describe('#store()', function() {
    it('#stores values, tracks index', function() {
      var r = new A.Cbuffer(2);
      
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
      var r = new A.Cbuffer(17);
      
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
      var r = new A.Cbuffer(5);
      
      var arrayEmpty = function() { r.slice(1, 1); }
      chai.expect(arrayEmpty).to.throw(ReferenceError, "Bad arguments");
    })
    
    it('#returns expected sections of its array', function() {
      var howManyEntries = 10;
      var r = new A.Cbuffer(howManyEntries);
      
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
  
  describe('#reset()', function() {
    it('#discard internal array, reset index', function() {
      var howManyEntries = 10;
      var r = new A.Cbuffer(howManyEntries);
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
  
  describe('#getSpreadAt()', function() {
    it('#cross boundary back to zero when necessary', function() {
      var howManyEntries = 10, result = null;
      var r = new A.Cbuffer(howManyEntries);
    
      for(var i = 0; i < howManyEntries; i++) { r.store(i); }
      
      chai.expect(r.getSpreadAt(0, 1)).eql([0]);
      chai.expect(r.getSpreadAt(1, 1)).eql([1]);
      chai.expect(r.getSpreadAt(2, 1)).eql([2]);
      chai.expect(r.getSpreadAt(3, 1)).eql([3]);
      chai.expect(r.getSpreadAt(4, 1)).eql([4]);
      chai.expect(r.getSpreadAt(5, 1)).eql([5]);
      chai.expect(r.getSpreadAt(6, 1)).eql([6]);
      chai.expect(r.getSpreadAt(7, 1)).eql([7]);
      chai.expect(r.getSpreadAt(8, 1)).eql([8]);
      chai.expect(r.getSpreadAt(9, 1)).eql([9]);

      chai.expect(r.getSpreadAt(0, 3)).eql([9, 0, 1]);
      chai.expect(r.getSpreadAt(1, 3)).eql([0, 1, 2]);
      chai.expect(r.getSpreadAt(2, 3)).eql([1, 2, 3]);
      chai.expect(r.getSpreadAt(3, 3)).eql([2, 3, 4]);
      chai.expect(r.getSpreadAt(4, 3)).eql([3, 4 ,5]);
      chai.expect(r.getSpreadAt(5, 3)).eql([4, 5, 6]);
      chai.expect(r.getSpreadAt(6, 3)).eql([5, 6, 7]);
      chai.expect(r.getSpreadAt(7, 3)).eql([6, 7, 8]);
      chai.expect(r.getSpreadAt(8, 3)).eql([7, 8, 9]);
      chai.expect(r.getSpreadAt(9, 3)).eql([8, 9, 0]);

      chai.expect(r.getSpreadAt(0, 5)).eql([8, 9, 0, 1, 2]);
      chai.expect(r.getSpreadAt(1, 5)).eql([9, 0, 1, 2, 3]);
      chai.expect(r.getSpreadAt(2, 5)).eql([0, 1, 2, 3, 4]);
      chai.expect(r.getSpreadAt(3, 5)).eql([1, 2, 3, 4, 5]);
      chai.expect(r.getSpreadAt(4, 5)).eql([2, 3, 4 ,5, 6]);
      chai.expect(r.getSpreadAt(5, 5)).eql([3, 4, 5, 6, 7]);
      chai.expect(r.getSpreadAt(6, 5)).eql([4, 5, 6, 7, 8]);
      chai.expect(r.getSpreadAt(7, 5)).eql([5, 6, 7, 8, 9]);
      chai.expect(r.getSpreadAt(8, 5)).eql([6, 7, 8, 9, 0]);
      chai.expect(r.getSpreadAt(9, 5)).eql([7, 8, 9, 0, 1]);
    });
  });
});
