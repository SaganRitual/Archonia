Cbuffer = function() {
  
};

Cbuffer.prototype = {
  forEach: function(callback, context) {
    if(context === undefined) { context = this; }
    callback.call(context, 0, 1);
  },
  
  store: function() {}
};

module.exports = Cbuffer;