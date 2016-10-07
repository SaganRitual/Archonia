var chai = require('chai');

var Sun = require('../Sun.js');

describe("Sun", function() {
  it('#smoke', function() {
    chai.expect(Sun.ignite).to.not.throw();
  });
  
  it('#strength', function() {
    chai.expect(Sun.getStrength()).within(0, 1);
  });
});
