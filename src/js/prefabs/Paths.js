
var Path = require("./Path");

module.exports = Collection.extend({

  hasOne: function(naId, nbId){
    return this.entities.some(function(path){
      var pa = path.na.id, pb = path.nb.id;
      return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
    });
  },

  addOne: function(nA, nB){
    if (nB && !this.hasOne(nA.id, nB.id)){
      
      nA.addNear(nB);
      nB.addNear(nA);

      this.entities.push(new Path({
        na: nA, 
        nb: nB
      }));
    }
  }

});
