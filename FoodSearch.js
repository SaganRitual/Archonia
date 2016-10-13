/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

(function(Archonia) {

Archonia.Form.FoodSearch = function(motioner) {
  this.motioner = motioner;
  
  this.topBoundary = 25;
  this.bottomBoundary = Archonia.Engine.game.height - 25;
  
  this.leftBoundary = 25;
  this.rightBoundary = Archonia.Engine.game.width - 25;
  
  this.turnAngle = 11 * Math.PI / 12;
  this.timeBetweenTurns = 2 * 60;
  this.whenToTurnNext = 0;
  this.turning = false;
};

Archonia.Form.FoodSearch.prototype = {
  start: function() {
    this.dVelocity = Archonia.Axioms.integerInRange(0, 1) || -1;

    var wedge = Archonia.Axioms.realInRange(0, 2 * Math.PI);
    var robalized = wedge * this.dVelocity;
    var theta = Archonia.Axioms.computerizeAngle(robalized);
    var tv = Archonia.Form.XY.fromPolar(25, theta);
    
    this.motioner.setTargetVelocity(tv, false);
  },
  
  tick: function() {
    if(!this.motioner.maneuverComplete) { return; }
    
    var temp = Archonia.Cosmos.Sun.getTemperature(this.motioner.sprite.archon.position);
    var tooHot = temp > this.motioner.sprite.archon.genome.optimalHiTemp;
    var tooCold = temp < this.motioner.sprite.archon.genome.optimalLoTemp;
    
    //var tempRadius = this.motioner.sprite.archon.genome.tempRadius;
    
    //var topOfRange = 100;
    //var bottomOfRange = 500;
    var topBoundary = 25, bottomBoundary = 575, leftBoundary = 25, rightBoundary = 575;
    
    var yCorrect = 0, xCorrect = 0;

    if(tooHot || this.motioner.sprite.y < topBoundary) { yCorrect = 1; }
    else if(tooCold || this.motioner.sprite.y > bottomBoundary) { yCorrect = -1; }

    if(this.motioner.sprite.x < leftBoundary) { xCorrect = 1; }
    else if(this.motioner.sprite.x > rightBoundary) { xCorrect = -1; }
    
    if(Math.sign(this.motioner.archonVelocity.x) === Math.sign(xCorrect)) { xCorrect = 0; }
    if(Math.sign(this.motioner.archonVelocity.y) === Math.sign(yCorrect)) { yCorrect = 0; }
    
    if(xCorrect !== 0 || yCorrect !== 0) {
      var a = Archonia.Form.XY(this.motioner.archonVelocity);
      if(xCorrect !== 0) { a.x *= -1; } if(yCorrect !== 0) { a.y *= -1; }
      
      var theta = a.getAngleFrom(0);
      //var robalized = Archonia.Axioms.robalizeAngle(theta) + (this.dVelocity * turnAngle);
      //var computerized = Archonia.Axioms.computerizeAngle(robalized);
      var tv = Archonia.Form.XY.fromPolar(25, theta);
    
      this.dVelocity *= -1;
      this.turning = true;
      this.motioner.setTargetVelocity(tv, false);
    }
  }
};

})(Archonia);
