module.exports = {
  game: {
    rnd: { 
      realInRange: function(lo, hi) { return Math.random() * (hi - lo) + lo; },
      integerInRange: function(lo, hi) {  return Math.floor(module.exports.game.rnd.realInRange(lo, hi)); }
    },
  
    physics: {
      enable: function() {}
    }
  }
};
