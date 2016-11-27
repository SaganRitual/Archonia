/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
  undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

Archonia.Form.Legs = function(archon) {

  this.state = archon.state;

  this.running = false;
  
  this.targetPosition = Archonia.Form.XY();
  this.previousPosition = Archonia.Form.XY();

  this.optimalDeltaV = Archonia.Form.XY();
  this.curtailedV = Archonia.Form.XY();
  this.bestDeltaV = Archonia.Form.XY();
};

Archonia.Form.Legs.prototype = {
  launch: function(maxMVelocity) {
    this.maxMVelocity = maxMVelocity;
    this.maxMAcceleration = Archonia.Axioms.maxForceOnBody / this.state.mass;
  },
  
  setTargetPosition: function(p) {
    this.currentMVelocity = this.maxMVelocity;
    
    this.running = true;
    this.targetPosition.set(p);
  },

  tick: function() { if(this.running) { this.updateMotion(); } },
  
  updateMotion: function() {
    var drawDebugLines = false;

    if(drawDebugLines) { Archonia.Engine.game.debug.text("WTF", 25, 25); }
    
    var ctx = Archonia.Engine.game.debug.context;
    var pos = this.state.position;
    var tgt = this.targetPosition;

    var vectorToHim = Archonia.Form.XY(tgt).minus(pos);

    if(drawDebugLines) {
      ctx.strokeStyle = 'yellow'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(vectorToHim.x + pos.x, vectorToHim.y + pos.y); ctx.stroke();
    
      ctx.strokeStyle = 'blue'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.lineTo(this.state.velocity.x + pos.x, this.state.velocity.y + pos.y);
      ctx.stroke();

      var wtfLine = vectorToHim.minus(this.state.velocity);
      ctx.strokeStyle = 'green'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.state.velocity.x + pos.x, this.state.velocity.y + pos.y);
      ctx.lineTo(this.state.velocity.x + pos.x + wtfLine.x, this.state.velocity.y + pos.y + wtfLine.y);
      ctx.stroke();
    }

    // Get the target into the same frame of reference as my
    // velocity vector. To do so, we need to get the angle between 
    // my vector and the distance vector from me to the target
  
    // This is the vector from my velocity to the target position
    // Using reflexives rather than scratchers for performance
    this.optimalDeltaV.set(this.targetPosition);
    this.optimalDeltaV.subtract(this.state.position);
    this.optimalDeltaV.add(this.state.velocity);
    
    // override here
    //this.optimalDeltaV.set(wtfLine);
    
    // The magnitude of that vector
    var optimalDeltaM = this.optimalDeltaV.getMagnitude();
    
    // And finally, the angle between my velocity and the
    // vector from me to the target
    var thetaToTarget = this.optimalDeltaV.getAngleFrom(0);
    var thetaFromTarget = this.optimalDeltaV.getAngleTo(0);
    
    if(drawDebugLines) {
      var whatReallyHappened = Archonia.Form.XY();
      whatReallyHappened.setPolar(optimalDeltaM, thetaToTarget);
      ctx.strokeStyle = 'red'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.state.velocity.x + pos.x, this.state.velocity.y + pos.y);
      ctx.lineTo(this.state.velocity.x + pos.x + whatReallyHappened.x, this.state.velocity.y + pos.y + whatReallyHappened.y);
      ctx.stroke();

      var oWhatReallyHappened = Archonia.Form.XY();
      oWhatReallyHappened.setPolar(optimalDeltaM, thetaFromTarget);
      ctx.strokeStyle = 'cyan'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(this.state.velocity.x + pos.x, this.state.velocity.y + pos.y);
      ctx.lineTo(this.state.velocity.x + pos.x + oWhatReallyHappened.x, this.state.velocity.y + pos.y + oWhatReallyHappened.y);
      ctx.stroke();
    }
    
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
    this.curtailedV.setPolar(curtailedM, thetaToTarget);

    // Now we have the best possible vector that our max mVelocity
    // will allow. But now we have to curtail it further to comply
    // with our maximum mAcceleration
    this.bestDeltaV.set(this.curtailedV);
    this.bestDeltaV.subtract(this.state.velocity);
    var bestDeltaM = this.bestDeltaV.getMagnitude();

    if(bestDeltaM > this.maxMAcceleration) {
      this.needUpdate = true;
    
      this.bestDeltaV.scalarMultiply(this.maxMAcceleration / bestDeltaM);
    }
    
    this.state.velocity.add(this.bestDeltaV);

    ctx.strokeStyle = 'orange'; ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.lineTo(this.state.velocity.x + pos.x, this.state.velocity.y + pos.y);
    ctx.stroke();

    if(this.state.velocity.getMagnitude() > this.maxMVelocity) {
      this.state.velocity.normalize();
      this.state.velocity.scalarMultiply(this.maxMVelocity);
    }
  }
};

})(Archonia);
