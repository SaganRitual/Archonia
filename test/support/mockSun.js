module.exports = {
  getStrength: function() {
    if(process.env['Sun.getStrength'] === undefined) { process.env['Sun.getStrength'] = 1; }
    return process.env['Sun.getStrength'];
  },
  
  getTemperature: function(where, whereY) {
    if(process.env['Sun.getTemperature'] === undefined) { process.env['Sun.getTemperature'] = 0; }
    return process.env['Sun.getTemperature'];
  },
  
  ignite: function() { }
};
