var chai = require('chai');
var data_driven = require('data-driven');
var Axioms = require('../Axioms.js');
var Legs = require('../Legs.js');
var xy = require('../widgets/XY.js'), XY = xy.XY, RandomXY = xy.RandomXY;

var archonPositionControl = XY();
var archonVelocityControl = XY();

var positionTracker = XY();

var maxMAccleration = null, maxMVelocity = null;

var frameCount = 0;

var tick = function(L, whichAxis) {
  L.tick(frameCount++);
  
  archonPositionControl.add(archonVelocityControl);
}

var getVelocity = function(Vi, t, a) { return Vi + (a * t); };
var getDisplacement = function(Vi, t, a)  { return Vi * t + (a * Math.pow(t, 2) / 2); };
var getAcceleration = function(Vf, Vi, t) { return (Vf - Vi) / t; }

var vaSets = [];

for(var i = 0; i < 10; i++) {
  var maxMv = Axioms.integerInRange(50, 100);
  var maxMa = Axioms.integerInRange(25, 50);
  
  var mlo = -Math.abs(maxMv), mhi = Math.abs(maxMv);

  var startv = new RandomXY(); startv.setMin(mlo, mlo); startv.setMax(mhi, mhi); startv.random();
  var from = new RandomXY(); from.setMin(-300, -300); from.setMax(300, 300); from.random();
  
  var theta = Axioms.computerizeAngle(Axioms.realInRange(0, 2 * Math.PI));
  var to = XY.fromPolar(500, theta); to.floor();
  
  var vaSet = {
    maxMv: maxMv, maxMa: maxMa,
    startv: startv.point, from: from.point, to: to,
    sv: startv.point.toString(), fp: from.point.toString(), tp: to.toString()
  };
  
  vaSets.push(vaSet);
}

var testSetTargetPoint = function(apc, mmv, avc, mma, targetPosition) {
  archonPositionControl.set(apc);
  archonVelocityControl.set(avc);

  frameCount = 0;
  maxMVelocity = mmv;
  maxMAcceleration = mma;
  
  var deltaCurrentVToFinalV = targetPosition.minus(archonVelocityControl);
  var deltaMv = deltaCurrentVToFinalV.getMagnitude();
  var expectedTicks = Math.abs(Math.ceil(deltaMv / maxMVelocity));
  
  var L = new Legs(archonPositionControl, maxMVelocity, archonVelocityControl, maxMAcceleration);
  
  L.setTargetPosition(targetPosition);
  
  for(var i = 0; i < expectedTicks * 2; i++) {
    tick(L);

    if(targetPosition.getDistanceTo(archonPositionControl) < 50) { break; }
  }
  
  chai.expect(archonPositionControl.getDistanceTo(targetPosition)).lessThan(50);
};

describe("Legs", function() {
  describe("Point-to-point", function() {
    data_driven(vaSets, function() {
      it('#velocity {sv} from point {fp} to point {tp}', function(test) {
        testSetTargetPoint(test.from, test.maxMv, test.startv, test.maxMa, test.to);
      });
    });
  });
});