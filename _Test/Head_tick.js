var Head = function(state) {
  this.state = state;
};

Head.prototype = {

tick: function(frameCount, manna, archons) {
  this.frameCount = frameCount;
  
  this.state.tick(frameCount, manna, archons);
  if(dangerousArchonId === null && tastyArchonId === null) {
    this.standardMove(foodTarget);
  } else if(dangerousArchonId !== null) {
    this.flee(dangerousArchonId);
  } else {
    this.prey(tastyArchonId);
  }
  
  this.firstTickAfterLaunch = false;
}

};

module.exports = Head;