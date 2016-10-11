var SensorArray = function(howManyMeasurementPoints, measurementDepth, decayRate, valuesRangeLo, valuesRangeHi) {
  if(process.env["SensorArray.uniqueID"] === undefined) { throw new Error("mock SensorArray needs environment varables"); }
  
  this.uniqueID = parseInt(process.env["SensorArray.uniqueID"]);
  process.env["SensorArray.uniqueID"] = (this.uniqueID + 1).toString();
  
  this.bestSignalEnvName = "SensorArray(" + this.uniqueID + ").signal";
  this.directionEnvName = "SensorArray(" + this.uniqueID + ").direction";
};

SensorArray.prototype = {
  getBestSignal: function(spread) { var r = JSON.parse(process.env[this.bestSignalEnvName]); return r; },
  store: function(where, value) {}
};

module.exports = SensorArray;
