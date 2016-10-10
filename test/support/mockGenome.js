var Genome = function() {
  this.optimalTemp = 0;
  this.tempRange = 400;
  this.howLongBadTempToEncystment = 5;
  this.foodSearchTimeBetweenTurns = 5;
};

module.exports = Genome;