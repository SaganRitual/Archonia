var chai = require('chai');

var MannaGenerator = require('../Manna.js');

describe("MannaGenerator", function() {
  it('#smoke', function() {
    var create = function() { return new MannaGenerator; }
    chai.expect(create).to.not.throw();
  });
  
  it('#internals, problems I ran into when first running in the browser', function() {
    var m = new MannaGenerator();
    chai.expect(m.randomPoint.max.x).not.equal(undefined);
    chai.expect(m.randomPoint.max.y).not.equal(undefined);
  });
});
