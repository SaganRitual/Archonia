var Phaser = {
  Easing: { Quartic: { InOut: function() {} } }
};

Phaser.Game = function(width, height, canvas) {
  this.width = width;
  this.height = height;
  this.canvas = canvas;
  this.state = new Phaser.State();
  this.physics = new Phaser.Physics();
};

Phaser.Game.prototype = {
  add: {
    bitmapData: function() {
      return {
        circle: function() {},
        context: {
          fillStyle: null,
          
          beginPath: function() {},
          
          createLinearGradient: function() {
            return {
              addColorStop: function() {}
            }
          },
          
          fill: function() {},
          
          fillRect: function() {}
        },
        getPixelRGB: function() {},
        update: function() {}
      }
    },
    group: function() { return {
      enableBody: null,
      createMultiple: function() {},
      forEach: function() {}
    }},
    image: function() {},
    tween: function() { return { to: function() {} }; },
    sprite: function() {
      return {
        alpha: null, tint: null,
        anchor: { setTo: function() {} },
        scale: { setTo: function() {} }
      };
    }
  },
  cache: {
    addBitmapData: function() {},
    getBitmapData: function() {}
  },
  input: { keyboard: { createCursorKeys: function() {} }, onUp: { add: function() {} }, onDown: { add: function() {} } },
  
  update: function() { this.currentState.update(); }
};

Phaser.Physics = function() {
  this.started = false;
};

Phaser.Physics.prototype = {
  enable: function() {},
  startSystem: function() { this.started = true; }
};

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
},


module.exports = Phaser;