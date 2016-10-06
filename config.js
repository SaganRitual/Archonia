var config = null;

(function(config) {
  config = {
    gameWidth: 600,
    gameHeight: 600
  };
})(config);

if(typeof window === "undefined") {
  module.exports = config;
}

