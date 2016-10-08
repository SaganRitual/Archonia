var chai = require('chai');

var MannaGenerator = require('../MannaGenerator.js');

describe("MannaGenerator", function() {
  it('#smoke', function() {
    chai.expect(MannaGenerator.start).to.not.throw();
  });
  
  it('#internals, problems I ran into when first running in the browser', function() {
    chai.expect(MannaGenerator.randomPoint.max.x).not.equal(undefined);
    chai.expect(MannaGenerator.randomPoint.max.y).not.equal(undefined);
  });
});
