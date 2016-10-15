/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof window === "undefined") {
  Archonia.Form.XY = require('./widgets/XY.js').XY;
}

(function(Archonia) {

Archonia.Form.Legs = function(position, maxMVelocity, velocity, maxMAcceleration) {
  this.position = position; this.maxMVelocity = maxMVelocity;
  this.velocity = velocity; this.maxMAcceleration = maxMAcceleration;
  
  this.targetPosition = Archonia.Form.XY();
};

Archonia.Form.Legs.prototype = {
  setTargetPosition: function(p) {
    this.currentMVelocity = this.maxMVelocity;
    
    this.targetPosition.set(p);
  },
  
/*  setTargetRotaton: function(t) {
    
  },*/
  
/*  setTargetVelocity: function(v) {
    
  },*/
  
  tick: function(/*frameCount*/) {
    if(this.targetPosition.getDistanceTo(this.position) > 50) { this.needUpdate = true; }
    
    this.updateMotion();
  },
  
  updateMotion: function() {

    // Get the target into the same frame of reference as my
    // velocity vector. To do so, we need to get the angle between 
    // my vector and the distance vector from me to the target
    
    // This is the vector from my velocity to the target position
    var optimalDeltaV = this.targetPosition.minus(this.position).plus(this.velocity);
    
    // The magnitude of that vector
    var optimalDeltaM = optimalDeltaV.getMagnitude();
    
    // And finally, the angle between my velocity and the
    // vector from me to the target
    var thetaToTarget = optimalDeltaV.getAngleFrom(0);
    
    // The optimal mVelocity from me to the target is, of
    // course, the magnitude of the vector, that is, a magnitude
    // that gets me there instantly. Obviously that doesn't
    // work, so I have to get there in increments based
    // on my current mVelocity -- which we always set, at
    // the beginning of each maneuver, to our maximum mVelocity,
    // and we change it only when we near the end of the
    // maneuver, to slow down so we don't end up circling
    // the target for all eternity

    // As long as our desired mVelocity is greater than our
    // current mVelocity (which we always set to max at the
    // beginning of each maneuver), we need to keep going into
    // our update
    if(optimalDeltaM > this.currentMVelocity) { this.needUpdate = true; }
    
    // The best we can do on this iteration, based on our current mVelocity
    var curtailedM = Math.min(optimalDeltaM, this.currentMVelocity);
    
    // Point me to the target with my maximum possible mVelocity
    var curtailedV = Archonia.Form.XY.fromPolar(curtailedM, thetaToTarget);

    // Now we have the best possible vector that our max mVelocity
    // will allow. But now we have to curtail it further to comply
    // with our maximum mAcceleration
    var bestDeltaV = curtailedV.minus(this.velocity);
    var bestDeltaM = bestDeltaV.getMagnitude();

    if(bestDeltaM > this.maxMAcceleration) {
      this.needUpdate = true;
    
      bestDeltaV.scalarMultiply(this.maxMAcceleration / bestDeltaM);
    }

    // And finally, the max change in mVelocity and mAcceleration allowed
    this.velocity.add(bestDeltaV);
  }
};

})(Archonia);

if(typeof window === "undefined") {
  module.exports = Archonia.Form.Legs;
}
