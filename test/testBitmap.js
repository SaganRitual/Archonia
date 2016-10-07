var chai = require('chai');

var BitmapFactory = require('../Bitmap.js');

describe("BitmapFactory", function() {
  describe("#archonia", function() {
    it('#smoke', function() {
      var create = function() { return BitmapFactory.makeBitmap('archonia'); }
      chai.expect(create).to.not.throw();
    });
    
    it('#bitmap', function() {
      var archoniaBitmap = BitmapFactory.makeBitmap('archonia');
      var phaserBitmap = archoniaBitmap.bm;
      
      chai.expect(phaserBitmap).not.equal(undefined);
      chai.expect(phaserBitmap.calledCreateLinearGradient).true;
      chai.expect(phaserBitmap.calledUpdate).true;
      chai.expect(phaserBitmap.calledAddColorStop).true;
      chai.expect(phaserBitmap.game.calledAddImage).true;
    });
  });
  
  describe("#archoniaGoo", function() {
    it('#smoke', function() {
      var create = function() { return BitmapFactory.makeBitmap('archoniaGoo'); }
      chai.expect(create).to.not.throw();
    });
    
    it('#bitmap', function() {
      var archoniaBitmap = BitmapFactory.makeBitmap('archoniaGoo');
      var phaserBitmap = archoniaBitmap.bm;
      
      chai.expect(phaserBitmap).not.equal(undefined);
      chai.expect(phaserBitmap.calledBeginPath).true;
      chai.expect(phaserBitmap.calledFill).true;
      chai.expect(phaserBitmap.calledCircle).true;
      chai.expect(phaserBitmap.game.calledAddBitmapData).true;
    });
  });
});