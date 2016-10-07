var Phaser = {
  Easing: { Quartic: { InOut: function() {} } }
};

var _this = null; // Live code doesn't care about context, but tests do

Phaser.Game = function(width, height, canvas) {
  this.canvas = canvas;
  this.state = new Phaser.State();
  this.physics = new Phaser.Physics();
  this.rnd = new Phaser.Random();
  
  this.calledAddBitmapData = false;
  this.calledAddImage = false;
  
  this.cache = new Phaser.Cache();
  
  _this = this;
};

Phaser.Game.prototype = {
  add: {
    bitmapData: function(width, height) { return new Phaser.BitmapData(width, height, this); },
    
    group: function() { return {
      enableBody: null,
      createMultiple: function() {},
      forEach: function(f, c) { var s = _this.add.sprite(); f.call(c, s); }
    }},
    
    image: function() { _this.calledAddImage = true; },
    tween: function() { return { to: function() {} }; },
    sprite: function() {
      return {
        alpha: null, tint: null,
        anchor: { setTo: function() {} },
        scale: { setTo: function() {} },
        body: { setSize: function() {}, bounce: { setTo: function() {} } }
      };
    }
  },
  
  input: { keyboard: { createCursorKeys: function() {} }, onUp: { add: function() {} }, onDown: { add: function() {} } },
  rnd: null,
  
  update: function() { this.currentState.update(); }
};

Phaser.Cache = function() {
};

Phaser.Cache.prototype = {
  addBitmapData: function() { _this.calledAddBitmapData = true; },
  getBitmapData: function() {}
};

Phaser.Physics = function() {
  this.started = false;
};

Phaser.Physics.prototype = {
  enable: function() {},
  startSystem: function() { this.started = true; }
};

Phaser.Random = function() {
  
};

Phaser.Random.prototype = {
  integerInRange: function(lo, hi) { return Math.floor(this.realInRange(lo, hi)); },
  realInRange: function(lo, hi) { return Math.random() * (hi - lo) + lo; }
}

Phaser.State = function() {
  this.states = [];
  this.currentState = null;
};

Phaser.State.prototype = {
  add: function(name, state) {
    this.states.push({ name: name, state: state });
  },
  
  create: function() {
    this.currentState.create();
  },

  start: function(stateName) {
    var stateInfo = this.states.find(function(e) { 
      if(e.name === stateName) { 
        return e.state; } else { 
          return undefined; } });

          this.currentState = stateInfo.state;
  },
  
  update: function() {
    this.currentState.update();
  }
};

Phaser.ColorStop = function(bitmap) {
  this.bitmap = bitmap;
};

Phaser.ColorStop.prototype = {
  addColorStop: function() { this.bitmap.calledAddColorStop = true; }
};

Phaser.Context = function(bitmap) {
  this.bitmap = bitmap;
};

Phaser.Context.prototype = {
  createLinearGradient: function() {
    this.bitmap.calledCreateLinearGradient = true; 
    return new Phaser.ColorStop(this.bitmap);
  },
  
  fillStyle: null,
  
  beginPath: function() { this.bitmap.calledBeginPath = true; },
  
  fill: function() { this.bitmap.calledFill = true; },
  
  fillRect: function(x, y, width, height) { 
    if(x === undefined || y === undefined ||
        width === undefined || height === undefined) { throw new Error("bad width/height for bitmap data"); }
        
    this.bitmap.calledfillRect = true;
  }
};

Phaser.BitmapData = function(width, height, game) {
  if(width === undefined || height === undefined) { throw new Error("bad width/height for bitmap data"); }
  this.game = _this;
  this.calledCreateLinearGradient = false;
  this.calledBeginPath = false;
  this.calledfillRect = false;
  this.calledFill = false;
  this.calledAddColorStop = false;
  this.calledCircle = false;
  
  this.context = new Phaser.Context(this);
};

Phaser.BitmapData.prototype = {
  circle: function() { this.calledCircle = true; },
  getPixelRGB: function(junk1, junk2, rgbObject) { this.calledGetPixelRGB = true; rgbObject.l = 0; }, // ell, not the number 1
  update: function() { this.calledUpdate = true; }
};


module.exports = Phaser;