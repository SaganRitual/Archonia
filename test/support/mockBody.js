var A = A || {};

if(A.XY === undefined) {
  A.XY = require('../../widgets/XY.js');
}

var Body = function() {
  this.movementTarget = A.XY();
};

Body.prototype = {
  setMovementTarget: function(target) {
    this.movementTarget.set(target);
  }
};

module.exports = Body;
