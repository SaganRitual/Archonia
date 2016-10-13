/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

Archonia.Form.Mover = function(sprite, maxSpeed, archonVelocity, archonPosition) {
  this.center = Archonia.Engine.game.world.centerY;
  this.radius = 100;
  this.topOfRange = 0;
  this.bottomOfRange = 0;

  this.frameCount = 0;
  this.maneuverAdjustStamp = 0;
  this.maneuverStamp = 0;
  this.maneuverTimeout = 2 * 60;
  this.maneuverComplete = true;
  this.needUpdate = false;
  this.damper = 10;

  this.sprite = sprite;
  this.archonVelocity = archonVelocity;
  this.archonPosition = archonPosition;

  this.maxSpeed = maxSpeed;
  this.maxAcceleration = 15;
  
  this.currentSpeed = 0;

  this.target = Archonia.Form.XY();
  this.targetVelocity = Archonia.Form.XY();
  
  this.maneuverName = 'go';

  this.searcher = new Archonia.Form.FoodSearch(this);
};

Archonia.Form.Mover.prototype.launch = function() {
  this.searcher.start();
};

Archonia.Form.Mover.prototype.setTarget = function(target) {
  this.target.set(target);
  this.maneuverStamp = this.frameCount;
  this.currentSpeed = this.maxSpeed;

  this.maneuverComplete = false;
  this.setNewVelocity();
};

Archonia.Form.Mover.prototype.setTargetVelocity = function(targetVelocity, isPoint) {
  if(isPoint === undefined) { isPoint = true; }
  
  this.maneuverStamp = this.frameCount;
  this.currentSpeed = this.maxSpeed;

  this.maneuverComplete = false;

  if(isPoint) {
    var t = Archonia.Form.XY(targetVelocity);
    var theta = t.getAngleFrom(300, 300);

    this.targetVelocity = Archonia.Form.XY.fromPolar(this.maxSpeed, theta);
  } else {
    this.targetVelocity.set(targetVelocity);
  }
  
  this.setNewVelocity();
};

Archonia.Form.Mover.prototype.setNewVelocity = function() {
  this.maneuverAdjustStamp = this.frameCount;

  // Get his into the same frame of reference as the velocity vector
  var currentVelocity = Archonia.Form.XY(this.archonVelocity);

  // Get the angle between my velocity vector and
  // the distance vector from me to him.
  var optimalDeltaV = this.targetVelocity;
  var optimalDeltaM = optimalDeltaV.getMagnitude();
  var thetaToTarget = optimalDeltaV.getAngleFrom(0);

  this.needUpdate = (optimalDeltaM > this.currentSpeed);
  
  var curtailedM = Math.min(optimalDeltaM, this.currentSpeed);
  var curtailedV = Archonia.Form.XY.fromPolar(curtailedM, thetaToTarget);

  // Now we need to know how much change we intend to apply
  // to the current velocity vectors, so we can scale that
  // change back to limit the acceleration.
  var bestDeltaV = curtailedV.minus(currentVelocity);
  var bestDeltaM = bestDeltaV.getMagnitude();

  if(bestDeltaM > this.maxAcceleration) {
    this.needUpdate = true;
    
    bestDeltaV.scalarMultiply(this.maxAcceleration / bestDeltaM);
  }

  var newVelocity = bestDeltaV.plus(this.archonVelocity);

  this.archonVelocity.set(newVelocity.x, newVelocity.y);
};

Archonia.Form.Mover.prototype.decide = function() {
  if(this.maneuverComplete) { return; }
  
  if(this.frameCount > (this.maneuverStamp + this.maneuverTimeout)) {
    if(this.maneuverName === 'go') {
      var t = Archonia.Form.XY(this.archonVelocity);

      if(Archonia.Axioms.isWithinRange(t.getMagnitude(), 0.05, 25)) {
        this.maneuverName = 'go';
        this.maneuverComplete = true;
      } else {
        t.scaleTo(25);
        this.maneuverName = 'finalize';
        this.setTargetVelocity(t, false);
      }
      
    } else {
      this.maneuverName = 'go';
      this.maneuverComplete = true;
    }
  }

  if(
    !this.maneuverComplete && this.needUpdate &&
    this.frameCount > this.maneuverAdjustStamp + this.damper) {
    this.setNewVelocity();
  }
};

Archonia.Form.Mover.prototype.tick = function() {
  this.frameCount++;
  
  this.decide();
  this.searcher.tick(this.frameCount);
};

})(Archonia);
