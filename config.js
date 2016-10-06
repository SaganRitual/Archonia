var C = C || {};

(function(C) {
  C.config = {
    gameWidth: 600,
    gameHeight: 600
  };
})(C);

if(typeof window === "undefined") {
  module.exports = C.config;
}

