var chai = require('chai');

var Sun = require('../Sun.js');

describe("Sun", function() {
  it('#smoke', function() {
    chai.expect(Sun.ignite).to.not.throw();
  });
  
  it('#arguments', function() {
    var r = function() { Sun.getTemperature(); };
    var s = function() { Sun.getTemperature("hello"); };
    chai.expect(r).to.throw(Error, "Bad arg");
    chai.expect(s).to.throw(Error, "Bad arg");
  });
  
  it('#strength', function() {
    chai.expect(Sun.getStrength()).within(0, 1);
  });
});
