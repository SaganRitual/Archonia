var Archotype = {};
Archotype.SensorArray = require('../widgets/SensorArray.js');

var chai = require('chai');

describe('SensorArray', function() {
  describe('#reset(), isEmpty()', function() {
    it('#before store, after store, after reset', function() {
      var measurementDepth = 10, howManyMeasurementPoints = 1, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
      var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
      chai.expect(c.isEmpty()).equal(true);
      for(i = 0; i < howManyMeasurementPoints; i++) { chai.expect(c.signalSmoothers[i].isEmpty()).equal(true); }
      
      c.store(0);
      chai.expect(c.isEmpty()).equal(false);
      for(i = 0; i < howManyMeasurementPoints; i++) { chai.expect(c.signalSmoothers[i].isEmpty()).equal(false); }
      
      c.reset();
      chai.expect(c.isEmpty()).equal(true);
      for(i = 0; i < howManyMeasurementPoints; i++) { chai.expect(c.signalSmoothers[i].isEmpty()).equal(true); }
    });
  });
  
  describe('Cost/benefit functionality', function() {
    describe('#getBestSignal(), single input point, single tick', function() {
      it('#boring values range 0 - 100', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 1, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 100);
        var s = c.getBestSignal();
      
        chai.expect(s).to.include({ direction: 0, weight: 0.099 });
      });

      it('#exciting values range 100 - 0', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 1, valueRangeLo = -100, valueRangeHi = 0, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 0);
        var s = c.getBestSignal();
      
        chai.expect(s).to.include({ direction: 0, weight: 0.099 });
      });
    });
    
    describe('#getBestSignal(), multiple inputs, single tick', function() {
      it('#boring values range 0 - 100', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 100); c.store(1, 50); c.store(2, 75); c.store(3, 90); c.store(4, 17);
        var s = c.getBestSignal();
      
        chai.expect(s.direction).within(0, 1);
        chai.expect(s.weight).equal(0.099);
      });

      it('#exciting values range -0.5 - +0.5', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = -0.5, valueRangeHi = +0.5, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 0.3); c.store(1, 0); c.store(2, 0.25); c.store(3, -0.20); c.store(4, -0.043);
        var s = c.getBestSignal();
      
        chai.expect(s.direction).within(0, 1);
        chai.expect(s.weight).equal(0.079);
      });
    })
    
    describe('#getBestSignal(), multiple inputs, multiple ticks', function() {
      it('#boring values range 0 - 100', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 100); c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4,  0);
        c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4,  0);
        c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4, 17);
        c.store(0, 0);   c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4,  0);
        c.store(0, 0);   c.store(1,  0); c.store(2,  0); c.store(3, 90); c.store(4,  0);
      
        var s = c.getBestSignal();
      
        chai.expect(s.direction).equal(3);
        chai.expect(s.weight.toFixed(4)).equal(((89 + 88 + 87 + 86 + 85) / (10 * 100)).toFixed(4));
      });

      it('#exciting values range -11 - +17', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = -11, valueRangeHi = 17, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 17);  c.store(1,  0); c.store(2, 10); c.store(3, 14.2); c.store(4,  0);
        c.store(0, 0);   c.store(1,  3); c.store(2,  0); c.store(3, 14.2); c.store(4,  0);
        c.store(0, 0);   c.store(1,  3); c.store(2,  0); c.store(3, 14.2); c.store(4,  6);
        c.store(0, 0);   c.store(1,  0); c.store(2, 10); c.store(3, 14.2); c.store(4,  0);
        c.store(0, 0);   c.store(1,  0); c.store(2,  0); c.store(3, 14.2); c.store(4,  0);
      
        var s = c.getBestSignal();
      
        chai.expect(s.direction).equal(3);
        chai.expect(s.weight.toFixed(4)).equal(((89 + 88 + 87 + 86 + 85) / (10 * 100)).toFixed(4));
      });
    });
    
    describe('#getBestSignal with spread', function() {
      it('#boring values range 0 - 100', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = 0, valueRangeHi = 100, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 100); c.store(1,  0); c.store(2,  5); c.store(3, 90); c.store(4,  0);
        c.store(0, 0);   c.store(1, 50); c.store(2,  0); c.store(3, 90); c.store(4, 50);
        c.store(0, 100); c.store(1, 50); c.store(2,  0); c.store(3,  0); c.store(4, 17);
        c.store(0, 0);   c.store(1,  0); c.store(2, 75); c.store(3, 90); c.store(4, 80);
        c.store(0, 0);   c.store(1,  0); c.store(2,  0); c.store(3, 90); c.store(4,  0);
      
        var s = null;
      
        s = c.getBestSignal(1); chai.expect(s.direction).equal(3);
        s = c.getBestSignal(2); chai.expect(s.direction).within(3, 4);
        s = c.getBestSignal(3); chai.expect(s.direction).equal(4);
      });

      it('#by now somewhat boring range -11 - 17', function() {
        var measurementDepth = 10, howManyMeasurementPoints = 5, valueRangeLo = -11, valueRangeHi = 17, decayRate = 0.01;
        var c = new Archotype.SensorArray(howManyMeasurementPoints, measurementDepth, decayRate, valueRangeLo, valueRangeHi);
      
        c.store(0, 17);  c.store(1,  0); c.store(2, -9.6); c.store(3, 14.2); c.store(4,   0);
        c.store(0, 0);   c.store(1,  3); c.store(2,    0); c.store(3, 14.2); c.store(4,   3.0);
        c.store(0, 17);  c.store(1,  3); c.store(2,    0); c.store(3,    0); c.store(4, 100.0);
        c.store(0, 0);   c.store(1,  0); c.store(2,   10); c.store(3, 14.2); c.store(4,  11.4);
        c.store(0, 0);   c.store(1,  0); c.store(2,    0); c.store(3, 14.2); c.store(4,   0);
      
        var s = null;
      
        s = c.getBestSignal(1); chai.expect(s.direction).equal(3);
        s = c.getBestSignal(2); chai.expect(s.direction).within(3, 4);
        s = c.getBestSignal(3); chai.expect(s.direction).equal(4);
      });
    });
  });
});
