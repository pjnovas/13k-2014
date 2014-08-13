
//var Path = require("./Path");

var Paths = module.exports = function(opts){
  this.nodes = opts.nodes;
  this.paths = [];
  this.createPaths();
};

Paths.prototype.createPaths = function(){
  /*
  var ps = this.nodes;
  var pl = ps.length;

  for (var i=0; i<pl; i++){
    this.paths.push(new Path({
      from: p,
      to: p,
      size: 7
    }));
  }
  */
};

Paths.prototype.update = function(){
  
};

Paths.prototype.draw = function(ctx){
  var ps = this.paths;
  var pl = ps.length;

  for (var i=0; i<pl; i++){
    ps[i].draw(ctx);
  }

};