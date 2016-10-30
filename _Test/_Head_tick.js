var chai = require("chai");
var XY = require("../../widgets/XY.js").XY;

var genome = {
  tempThresholdHorizontalOk: 0.50,
  tempThresholdVerticalOnly: 0.75,
  tempThresholdEncyst:       0.85,

  tempToleranceMultiplier:   1.00,
  hungerToleranceMultiplier: 1.00,
  
  predationRatio: 1.5,
  predatorFearRatio: 2,
  
  toxinStrength: 1,
  toxinResistance: 1
};

var position = XY();

var Xym = function() {
  
};

Xym = function(x, y, m) {
  if(m === undefined) { m = 2; }
  this.mass = m;
  this.genome = { predationRatio: 2, toxinStrength: 1, toxinResistance: 1 };
  XY.call(this, x, y);
};

Xym.prototype = Object.create(XY.prototype);
Xym.prototype.constructor = XY;
Xym.prototype.getMass = function() { return this.mass; };


var State = function(genome, position) {
  this.genome = genome;
  this.position = position;
  this.mannaOfInterest = new Xym();
  this.evade = new Xym();
  this.pursue = new Xym();
  this.theOtherGuy = new Xym();
  this.reset();
};

State.prototype = {
  getAction: function() {
    var touchedArchonAction = this.getTouchedArchonAction();
    if(touchedArchonAction === false) {

      var sensedArchonAction = this.getSensedArchonAction();
      if(sensedArchonAction === false) {

        var mannaGrabAction = this.getMannaGrabAction();
        if(mannaGrabAction === false) {
          return this.getFoodSearchAction();
        } else {
          return mannaGrabAction;
        }
      } else {
        return sensedArchonAction;
      }
    } else {
      return touchedArchonAction;
    }
  },
  
  getFoodSearchAction: function() {
    var action = 0;
    
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdHorizontalOk) { action++; }
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdVerticalOnly) { action++; }
    if(Math.abs(this.tempSignal) > this.genome.tempThresholdEncyst) { action++; }
    
    var netTemp = Math.abs(this.tempSignal) * this.genome.tempToleranceMultiplier;
    var netHunger = this.hungerSignal * this.genome.hungerToleranceMultiplier;
    
    var where = null, result = { action: "foodSearch", where: "random" };
    if(netTemp > netHunger) {
      switch(action) {
        case 0: if(this.tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 1: if(this.tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
        case 2: { result = { action: "encyst" }; } break;
        case 3: { result = { action: "encyst" }; } break;
      }
    } else {
      switch(action) {
        case 0: result = { action: "foodSearch", where: "random" }; break;
        case 1: result = { action: "foodSearch", where: "random" }; break;
        case 2: if(this.tempSignal < 0) { result.where = "randomNoDown"; } else { result.where = "randomNoUp"; } break;
        case 3: if(this.tempSignal < 0) { result.where = "randomUpOnly"; } else { result.where = "randomDownOnly"; } break;
      }
    }
    
    return result;
  },
  
  getMannaGrabAction: function() {
    if(this.mannaOfInterest.equals(0)) { return false; }
    else { return { action: "move", where: this.mannaOfInterest }; }
  },
  
  getSensedArchonAction: function() {
    if(this.evade.equals(0)) {
      if(this.pursue.equals(0)) {
        return false;
      } else {
        return { action: "move", where: new Xym(this.pursue) };
      }
    } else {
      return { action: "move", where: new Xym(this.evade) };
    }
  },
  
  getTouchedArchonAction: function() {
    if(this.theOtherGuy.equals(0)) { return false; }
    else { return { action: "stop" }; }
  },
  
  getTween: function() { return this.tween; },
  
  launch: function() {
    reset();
  },
  
  reset: function() {
    this.firstTickAfterLaunch = true;
    this.tempSignal = 0;
    this.hungerSignal = 0;
    this.eatingOtherArchon = false;
    this.beingEaten = false;
    this.manna = [];
    this.sensedArchons = [];
    this.touchedArchons = [];
    this.mannaOfInterest.reset();
    this.evade.reset();
    this.pursue.reset();
    this.theOtherGuy.reset();
    
    this.tweenStage = "birth";
    this.tween = false;
  },
  
  senseManna: function(manna) { this.manna.push(manna); },
  senseOtherArchon: function(otherArchon) { this.sensedArchons.push(otherArchon); },
  setHungerSignal: function(signal) { this.hungerSignal = signal; },
  setTempSignal: function(signal) { this.tempSignal = signal; },
  
  tick: function(currentMass) {
    this.updateMannaTargets();
    this.updateSensedArchonTargets(currentMass);
    this.updateTouchedArchons(currentMass);
    this.updateTween();
    this.manna = [];
    this.sensedArchons = [];
    this.touchedArchons = [];
    this.tweenStage = false;
    this.firstTickAfterLaunch = false;
  },
  
  touchOtherArchon: function(otherArchon) { this.touchedArchons.push(otherArchon); },
  
  updateSensedArchonTargets: function(currentMass) {
    var closestArchon = new Xym();
    var action = null;
    
    if(this.evade.equals(0)) {
      if(!this.pursue.equals(0)) {
        closestArchon.set(this.pursue)
      }
    } else {
      closestArchon.set(this.evade);
    }

    for(var i = 0; i < this.sensedArchons.length; i++) {
      var checkArchon = this.sensedArchons[i];
      
      if((checkArchon.equals(this.evade)) ||
          checkArchon.getMass() * this.genome.predatorFearRatio > currentMass) {
        closestArchon.set(checkArchon);
        action = "evade";
        break;
      } else {
        if(currentMass * this.genome.predationRatio > checkArchon.getMass()) {
          action = "pursue";
          
          if(checkArchon.equals(this.pursue)) {
            closestArchon.set(this.pursue); // If we're already targeting, stay the course
            break;
          } else {
            if(checkArchon.getDistanceTo(this.position) < closestArchon.getDistanceTo(this.position)) {
              closestArchon.set(checkArchon);
            }
          }
        }
      }
    }
      
    this.evade.reset(); this.pursue.reset();
    if(action === "evade") {
      var a = this.position.getAngleFrom(closestArchon);
      var d = new Xym().setPolar(25, a).plus(this.position); d.floor();

      this.evade.set(d);
    } else if(action === "pursue") {
      this.pursue.set(closestArchon);
    }
  },
  
  updateMannaTargets: function() {
    var closestManna = new Xym();

    for(var i = 0; i < this.manna.length; i++) {
      var checkManna = this.manna[i];
      
      if(checkManna.equals(this.mannaOfInterest)) {
        closestManna.set(this.mannaOfInterest); // If we're already targeting, stay the course
        break;
      } else {
        if(checkManna.getDistanceTo(this.position) < closestManna.getDistanceTo(this.position)) {
          closestManna.set(checkManna);
        }
      }
    }
    
    if(closestManna.equals(0)) { this.mannaOfInterest.reset(); }
    else { this.mannaOfInterest.set(closestManna); }
  },
  
  updateTouchedArchons: function(currentMass) {
    var theOtherGuy = new Xym();
    
    for(var i = 0; i < this.touchedArchons.length; i++) {
      var checkArchon = this.touchedArchons[i];
      
      if(checkArchon.equals(this.theOtherGuy)) {
        theOtherGuy.set(this.theOtherGuy);
        break;
      } else {
        theOtherGuy.set(checkArchon);
        
        var iAmThePoisoner = this.genome.toxinStrength > checkArchon.genome.toxinResistance;
        var iAmThePoisoned = checkArchon.genome.toxinStrength > this.genome.toxinResistance;

        var iAmThePredator = currentMass * this.genome.predationRatio > checkArchon.getMass();
        var iAmThePrey = checkArchon.getMass() * checkArchon.genome.predationRatio > currentMass;

        if(iAmThePredator) {
          if(iAmThePoisoned) { this.tweenStage = "poisoned"; }
        } else if(iAmThePrey) {
          if(!iAmThePoisoner) { this.tweenStage = "eaten"; }
        }
      }
    }
    
    if(theOtherGuy.equals(0)) { this.theOtherGuy.reset(); }
    else { this.theOtherGuy.set(theOtherGuy); }
  },
  
  updateTween: function() { this.tween = this.tweenStage; }
};

var state = null;

describe("Head state", function() {
  describe("launch", function() {
    it("#initial state", function() {
      var state = new State(genome);
      state.tick();
      chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "random" });
      chai.expect(state.getTween()).equal("birth");
    });

    it("#clear all flags, same as initial state", function() {
      var state = new State(genome);
      state.reset();
      state.tick();
      chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "random" });
      chai.expect(state.getTween()).equal("birth");
    });
    
    it("#birth tween", function() {
      var state = new State(genome);
      state.tick();
      chai.expect(state.getTween()).equal("birth");
    });
    
    it("#birth tween signal only once, reset by tick", function() {
      var state = new State(genome);
      state.tick(1);
      chai.expect(state.getTween()).equal("birth");
      state.tick(1);
      chai.expect(state.getTween()).equal(false);
    });
  });
  
  describe("food search", function() {
    describe("temp, no other considerations, stricter than hunger", function() {
      it("#temp hi, within optimal tolerance", function() {
        var state = new State(genome, position);
        state.setTempSignal(genome.tempThresholdHorizontalOk / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoUp" });
      });
    
      it("#temp lo, within optimal tolerance", function() {
        var state = new State(genome);
        state.setTempSignal(-genome.tempThresholdHorizontalOk / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoDown" });
      });
    
      it("#temp hi, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomDownOnly" });
      });
    
      it("#temp lo, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomUpOnly" });
      });
    
      it("#temp hi, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    
      it("#temp lo, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    });
  
    describe("temp wins over hunger", function() {
      it("#temp hi, within optimal tolerance", function() {
        var state = new State(genome);
        state.setTempSignal(genome.tempThresholdHorizontalOk / 2);
        state.setHungerSignal(genome.tempThresholdHorizontalOk / 4);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoUp" });
      });
    
      it("#temp lo, within optimal tolerance", function() {
        var state = new State(genome);
        state.setTempSignal(-genome.tempThresholdHorizontalOk / 2);
        state.setHungerSignal(genome.tempThresholdHorizontalOk / 4);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoDown" });
      });
    
      it("#temp hi, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        state.setHungerSignal(genome.tempThresholdHorizontalOk / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomDownOnly" });
      });
    
      it("#temp lo, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        state.setHungerSignal(genome.tempThresholdHorizontalOk / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomUpOnly" });
      });
    
      it("#temp hi, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    
      it("#temp lo, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    
      it("#temp hi, beyond encyst limit", function() {
        var state = new State(genome);
        state.setTempSignal((1 + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    
      it("#temp lo, beyond encyst limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(1 + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "encyst" });
      });
    });
  
    describe("hunger wins over temp", function() {
      it("#hunger = temp, temp hi within optimal tolerance", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        state.setHungerSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "random" });
      });
    
      it("#hunger = temp, temp lo, within optimal tolerance", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2)
        state.setHungerSignal((genome.tempThresholdHorizontalOk + genome.tempThresholdVerticalOnly) / 2)
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "random" });
      });
    
      it("#hunger = temp, temp hi, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoUp" });
      });
    
      it("#hunger = temp, temp lo, between optimal and limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((genome.tempThresholdVerticalOnly + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomNoDown" });
      });
    
      it("#hunger = temp, temp hi, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal((1 + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((1 + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomDownOnly" });
      });
    
      it("#hunger = temp, temp lo, beyond limit", function() {
        var state = new State(genome);
        state.setTempSignal(-(1 + genome.tempThresholdEncyst) / 2);
        state.setHungerSignal((1 + genome.tempThresholdEncyst) / 2);
        chai.expect(state.getAction()).to.include({ action: "foodSearch", where: "randomUpOnly" });
      });
    });
  });
  
  describe("manna grab, no other archons, temp irrelevant at this stage in the history of Archonia", function() {
    it("#one manna detected, grab it", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "move", where: new Xym(310, 310) });
    });

    it("#multiple manna detected, grab closest", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.senseManna(new Xym(310, 300));
      state.senseManna(new Xym(290, 310));
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "move", where: new Xym(310, 300) });
    });

    it("#multiple manna detected, closer one on next tick, stay the original course", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.senseManna(new Xym(310, 320));
      state.tick(1);
      state.senseManna(new Xym(305, 305));
      state.senseManna(new Xym(310, 310));
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "move", where: new Xym(310, 310) });
    });

    it("#multiple manna detected, closer one on next tick, stay the original course", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.senseManna(new Xym(310, 320));
      state.tick(1);
      state.senseManna(new Xym(305, 305));
      state.senseManna(new Xym(310, 310));
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "move", where: new Xym(310, 310) });
    });
    
    it("#multiple detected, target goes away, multiple detected, go for closest", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.senseManna(new Xym(310, 320));
      state.tick(1);
      state.senseManna(new Xym(305, 305));
      state.senseManna(new Xym(310, 320));
      state.senseManna(new Xym(290, 320));
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "move", where: new Xym(305, 305) });
    });
    
    it("#manna detected, everything goes away, go back to food search", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseManna(new Xym(310, 310));
      state.senseManna(new Xym(310, 320));
      state.tick(1);
      state.tick(1);
      chai.expect(state.getAction()).to.deep.equal({ action: "foodSearch", where: "random" });
    });
  });
  
  describe("other archon detected, no manna, temp irrelevant at this stage in the history of Archonia", function() {
    it("#one archon detected, bigger, run away", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 4));
      state.tick(1);
      
      var a = new Xym(300, 300).getAngleFrom(310, 310);
      
      // wtf moment here: test fails if I use d, but if I
      // create a new Xym from it, it works fine.
      // The test legitimately passes, so I'll take it.
      var d = new Xym().setPolar(25, a).plus(300, 300); d.floor();
      var s = new Xym(d);

      var t = { action: "move", where: s };

      var r = state.getAction();
      
      delete r.where.mass; delete t.where.mass;
      
      chai.expect(r).to.deep.equal(t);
    });

    it("#one archon detected, smaller, pursue", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "move", where: new Xym(310, 310, 2) }; delete s.where.mass;
      
      chai.expect(r).to.deep.equal(s);
    });

    it("#multiple archons detected, smaller, pursue", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.senseOtherArchon(new Xym(305, 305, 2));
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "move", where: new Xym(310, 310, 2) }; delete s.where.mass;
      
      chai.expect(r).to.deep.equal(s);
    });

    it("#multiple archons detected, smaller, closer one on next tick, stay the original course", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.senseOtherArchon(new Xym(305, 305, 2));
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "move", where: new Xym(310, 310, 2) }; delete s.where.mass;
      
      chai.expect(r).to.deep.equal(s);
    });
    
    it("#multiple archons detected, target goes away, multiple detected, go for closest", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);
      state.senseOtherArchon(new Xym(305, 305, 2));
      state.senseOtherArchon(new Xym(290, 290, 2));
      state.tick(4);
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "move", where: new Xym(305, 305, 2) }; delete s.where.mass;
      
      chai.expect(r).to.deep.equal(s);
    });
    
    it("#multiple archons detected, everything goes away, go back to food search", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);
      state.tick(4);
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "foodSearch", where: "random" };
      
      chai.expect(r).to.deep.equal(s);
    });
  });
  
  describe("archon and manna both detected", function() {

    it("#pursuing archon, manna shows up on next tick; ignore the manna", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.senseOtherArchon(new Xym(310, 310, 2));
      state.tick(4);

      state.senseOtherArchon(new Xym(310, 310, 2));
      state.senseManna(new Xym(305, 305));
      state.tick(4);
      
      var r = state.getAction(); delete r.where.mass;
      var s = { action: "move", where: new Xym(310, 310, 2) }; delete s.where.mass;
      
      chai.expect(r).to.deep.equal(s);
    });
  });
  
  describe("other archon touched", function() {
    it("#predator, stop", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 4));
      state.tick(1);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
    });
    
    it("#prey, stop", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 1));
      state.tick(4);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
    });

    it("#predator, stop, predator goes away, food search", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 4));
      state.tick(1);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
      
      state.tick(1);
      
      t = { action: "foodSearch", where: "random" };
      r = state.getAction();

      chai.expect(r).to.deep.equal(t);
    });
  });
  
  describe("poison, tween", function() {
    it("#predator's resistance greater my toxicity, reset after tick", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 4));
      
      genome.toxinStrength = 0.5;
      state.tick(1);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
      chai.expect(state.getTween()).equal("eaten");

      state.tick(1);
      chai.expect(state.getTween()).equal(false);
    })

    it("#my resistance greater than predator's toxicity, reset after tick", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 4));
      
      genome.toxinStrength = 1.5;
      state.tick(1);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
      chai.expect(state.getTween()).equal("birth");

      state.tick(1);
      chai.expect(state.getTween()).equal(false);
    })

    it("#prey's resistance greater than my toxicity, reset after tick", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 1));
      
      genome.toxinResistance = 0.5;
      state.tick(4);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
      chai.expect(state.getTween()).equal("poisoned");

      state.tick(1);
      chai.expect(state.getTween()).equal(false);
    })

    it("#my resistance greater than prey's toxicity, reset after tick", function() {
      var state = new State(genome, position);
      position.set(300, 300);
      state.setTempSignal(0);
      state.setHungerSignal(0);
      state.touchOtherArchon(new Xym(300, 300, 1));
      
      genome.toxinResistance = 1.5;
      state.tick(4);
    
      var t = { action: "stop" };
      var r = state.getAction();
    
      chai.expect(r).to.deep.equal(t);
      chai.expect(state.getTween()).equal("birth");

      state.tick(1);
      chai.expect(state.getTween()).equal(false);
    })
  });
});
