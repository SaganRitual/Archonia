var chai = require('chai');
var Logger = require('../Minions/Logger.js');

var testOutput = null;

describe("Logger", function() {
  it("#log one message, show one message", function() {
    testOutput = [];
    Logger.initialize(1, testOutput);
    Logger.log("test message one");
    Logger.show(1);
    
    chai.expect(testOutput[0]).equal("0 (0): test message one");
  });
  
  it("#log two messages, show two messages", function() {
    testOutput = [];
    Logger.initialize(2, testOutput);
    Logger.log("test message one");
    Logger.log("test message two");
    Logger.show(2);
    
    chai.expect(testOutput[0]).equal("0 (0): test message one");
    chai.expect(testOutput[1]).equal("1 (1): test message two");
  })
  
  it("#log two messages, show most recent message", function() {
    testOutput = [];
    Logger.initialize(2, testOutput);
    Logger.log("test message one");
    Logger.log("test message two");
    Logger.show(1);

    chai.expect(testOutput.length).equal(1);
    chai.expect(testOutput[0]).equal("0 (1): test message two");
  })
  
  it("#log three messages, show two most recent messages", function() {
    testOutput = [];
    Logger.initialize(2, testOutput);
    Logger.log("test message one");
    Logger.log("test message two");
    Logger.log("test message three");
    Logger.show(2);

    chai.expect(testOutput.length).equal(2);
    chai.expect(testOutput[0]).equal("0 (1): test message two");
    chai.expect(testOutput[1]).equal("1 (2): test message three");
  })
});
