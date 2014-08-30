
$.Paths = $.Collection.extend({

  start: function(){
    this.entities = [];
  },

  hasOne: function(naId, nbId){
    return this.entities.some(function(path){
      var pa = path.na.cid, pb = path.nb.cid;
      return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
    });
  },

  addOne: function(nA, nB){
    if (nB && !this.hasOne(nA.cid, nB.cid)){
      
      nA.addNear(nB);
      nB.addNear(nA);

      this.entities.push(new $.Path({
        na: nA, 
        nb: nB
      }));
    }
  }

});
