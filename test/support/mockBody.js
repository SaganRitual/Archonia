var Archotype = Archotype || {};

if(Archotype.XY === undefined) {
  Archotype.XY = require('../../widgets/XY.js').XY;
}

var Body = function() {
  this.movementTarget = Archotype.XY();
};

Body.prototype = {
  setMovementTarget: function(target) {
    this.movementTarget.set(target);
  }
};

module.exports = Body;
