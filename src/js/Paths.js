
var Path = require("./Path");

var Paths = module.exports = function(){
  this.paths = [];
};

Paths.prototype.hasOne = function(a, b){

  return this.paths.some(function(path){
    var pa = path.a, pb = path.b;

    return (
      (Vector.eql(a, pa) || Vector.eql(a, pb)) &&
      (Vector.eql(b, pa) || Vector.eql(b, pb))
    );
  });
};

Paths.prototype.addOne = function(nA, nB){

  if (nB && !this.hasOne(nA.pos, nB.pos)){
    this.paths.push(new Path({
      a: Vector.clone(nA.pos),
      b: Vector.clone(nB.pos)
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