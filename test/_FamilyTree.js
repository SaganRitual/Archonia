var chai = require('chai');

var FamilyTree = require('../FamilyTree.js');
var Essence = require('../Essence.js');

describe("FamilyTree", function() {
    describe("Smoke test", function() {
        it("#constructor", function() {
           var f = null;
           var fn = function() { f = new FamilyTree(); };
           
           chai.expect(fn).to.not.throw();
        });
        
        it("#add archon, bad arguments", function() {
           var fn = function() { var f = new FamilyTree(); f.addMe(); }
           chai.expect(fn).to.throw(Error, "IDs missing");
        });
        
        it("#add archon, parent unknown", function() {
           var fn = function() { var f = new FamilyTree(); f.addMe(1, 2); }
           chai.expect(fn).to.throw(Error, "Parent unknown");
        });
        
        it("#add archon, child already in roster", function() {
           var fn = function() { var f = new FamilyTree(); f.addMe(1, 'god'); f.addMe(1, 'god'); };
           chai.expect(fn).to.throw(Error, "Child already in roster");
        });
    });

    describe("Degree of relatedness", function() {
        it("#self -> self", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            chai.expect(f.getDegreeOfRelatedness(1, 1)).equal(0);
        });
    
        it("#child of god -> god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            chai.expect(f.getDegreeOfRelatedness(1, 'god')).equal(1);
        });
    
        it("#god -> child of god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            chai.expect(f.getDegreeOfRelatedness('god', 1)).equal(1);
        });
    
        it("#2nd child of god -> god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            chai.expect(f.getDegreeOfRelatedness(1, 'god')).equal(1);
        });
        
        it("#archon -> child", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            chai.expect(f.getDegreeOfRelatedness(1, 2)).equal(1);
        });
        
        it("#archon -> parent", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            chai.expect(f.getDegreeOfRelatedness(2, 1)).equal(1);
        });
        
        it("#sib1 -> sib2", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1); f.addMe(3, 1);
            chai.expect(f.getDegreeOfRelatedness(2, 3)).equal(2);
        });
        
        it("#sib2 -> sib1", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1); f.addMe(3, 1);
            chai.expect(f.getDegreeOfRelatedness(3, 2)).equal(2);
        });
        
        it("#nephew -> uncle", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);
            chai.expect(f.getDegreeOfRelatedness(3, 2)).equal(3);
        });
        
        it("#uncle -> nephew", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);
            chai.expect(f.getDegreeOfRelatedness(2, 3)).equal(3);
        });
        
        it("#cousin1, gchild of god -> cousin2, gchild of god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            chai.expect(f.getDegreeOfRelatedness(3, 4)).equal(4);
        });
        
        it("#cousin2, gchild of god -> cousin1, gchild of god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            chai.expect(f.getDegreeOfRelatedness(4, 3)).equal(4);
        });
        
        it("#2nd cousin1, gchild of god -> 2nd cousin2, g-gchild of god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            f.addMe(5, 3);
            
            chai.expect(f.getDegreeOfRelatedness(5, 4)).equal(5);
        });
        
        it("#2nd cousin2, gchild of god -> 2nd cousin1, g-gchild of god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            f.addMe(5, 3);
            
            chai.expect(f.getDegreeOfRelatedness(4, 5)).equal(5);
        });
        
        it("#god -> grandchild", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            f.addMe(3, 2);
            chai.expect(f.getDegreeOfRelatedness(1, 3)).equal(2);
        });
        
        it("#grandchild -> god", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            f.addMe(3, 2);
            chai.expect(f.getDegreeOfRelatedness(3, 1)).equal(2);
        });
        
        it("#grandparent -> grandchild, both archons", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            f.addMe(3, 2);
            chai.expect(f.getDegreeOfRelatedness(1, 3)).equal(2);
        });
        
        it("#grandchild -> grandparent, both archons", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god');
            f.addMe(2, 1);
            f.addMe(3, 2);
            chai.expect(f.getDegreeOfRelatedness(3, 1)).equal(2);
        });
        
        it("#2nd cousin2, gchild of archon -> 2nd cousin1, g-gchild of archon", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            f.addMe(5, 3);     f.addMe(6, 4);
            f.addMe(7, 5);
            
            chai.expect(f.getDegreeOfRelatedness(7, 6)).equal(7);
        });
        
        it("#2nd cousin1, gchild of archon -> 2nd cousin2, g-gchild of archon", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);
            f.addMe(5, 3);     f.addMe(6, 4);
            f.addMe(7, 5);
            
            chai.expect(f.getDegreeOfRelatedness(6, 7)).equal(7);
        });
        
        it("#distant cousin1 -> distant cousin2", function() {
            var f = new FamilyTree();
            f.addMe(1, 'god'); f.addMe(2, 'god'); f.addMe(9, 'god');
            f.addMe(3, 1);     f.addMe(4, 2);     f.addMe(10, 9);
            f.addMe(5, 3);     f.addMe(6, 4);     f.addMe(11, 10);
            f.addMe(7, 5);     f.addMe(8, 6);     f.addMe(12, 11);
            f.addMe(13, 7);
            
            chai.expect(f.getDegreeOfRelatedness(13, 12)).equal(9);
            chai.expect(f.getDegreeOfRelatedness(12, 13)).equal(9);
            chai.expect(f.getDegreeOfRelatedness(7, 8)).equal(8);
            chai.expect(f.getDegreeOfRelatedness(8, 7)).equal(8);
        });
    });
});