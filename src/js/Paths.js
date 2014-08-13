
var Path = require("./Path");

var Paths = module.exports = function(){
  this.paths = [];
};

Paths.prototype.hasOne = function(naId, nbId){

  return this.paths.some(function(path){
    var pa = path.na.id, pb = path.nb.id;
    return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
  });
};

Paths.prototype.addOne = function(nA, nB){

  if (nB && !this.hasOne(nA.id, nB.id)){
    nA.addNear(nB);
    nB.addNear(nA);
    
    this.paths.push(new Path({
      na: nA,
      nb: nB
    }));
  }
};

Paths.prototype.update = function(){
  
};

Paths.prototype.draw = function(ctx){

  this.paths.forEach(function (path) {
    path.draw(ctx);
  });

};