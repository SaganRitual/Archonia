/* jshint forin:false, noarg:true, noempty:true, eqeqeq:true, bitwise:true, strict:true, loopfunc:true,
	undef:true, unused:true, curly:true, browser:true, indent:false, maxerr:50, jquery:true, node:true */

"use strict";

var Archonia = Archonia || { Axioms: {}, Cosmos: {}, Engine: {}, Essence: {}, Form: {} };

if(typeof module !== "undefined") {
    Archonia.Essence = require('./Essence.js');
}

(function(Archonia) {

Archonia.Cosmos.FamilyTree = function() {
  this.everyone = {
    'god': { parentId: 'none', myChildren: [] }
  };
};

Archonia.Cosmos.FamilyTree.prototype = {
  addMe: function(myId, idOfMyParent) {
    if(myId === undefined || idOfMyParent === undefined) {
        Archonia.Essence.hurl(new Archonia.Essence.BirthDefect("IDs missing"));
    }
    
    if(!this.everyone.hasOwnProperty(idOfMyParent)) {
      Archonia.Essence.hurl(new Error("Parent unknown"));
    }
    
    if(this.everyone.hasOwnProperty(myId)) {
      Archonia.Essence.hurl(new Error("Child already in roster"));
    }

    // Add me to the roster of everyone who ever lived
    this.everyone[myId] = { myId: myId, parentId: idOfMyParent, myChildren: [] };
    
    // Add me to my parent's list of children
    this.everyone[idOfMyParent].myChildren.push(myId);
  },
  
  getDegreeOfRelatedness: function(lhs, rhs) {
    var lhsAncestry  = [], rhsAncestry = [], i = null, commonAncestor = null;
    
    for(i = lhs; i !== 'none'; i = this.everyone[i].parentId) { lhsAncestry.push(i); }
    for(i = rhs; i !== 'none'; i = this.everyone[i].parentId) { rhsAncestry.push(i); }
    
    for(i = 0; i < lhsAncestry.length; i++) {
        commonAncestor = rhsAncestry.indexOf(lhsAncestry[i]);
        if(commonAncestor !== -1) { break; }
    }
    
    if(commonAncestor === -1 || commonAncestor === null) {
        Archonia.Essence.hurl(new Error("Couldn't find common ancestor for " + lhs + " and " + rhs));
    }
    
    return i + commonAncestor;
  },
  
  getLineage: function(myId) {
    var currentId = myId;
    var lineage = [];

    do {
      currentId = this.everyone[currentId].parentId;
      lineage.push(currentId);
      
    } while(currentId !== 'god');
    
    return lineage;
  }
};
  
})(Archonia);

if(typeof module !== "undefined") {
    module.exports = Archonia.Cosmos.FamilyTree;
}