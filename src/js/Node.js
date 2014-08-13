
var Node = module.exports = function(opts){
  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";

  this.nearNodes = [];
};

Node.prototype.addNearNode = function(node){
  this.nearNodes.push(node);
};

Node.prototype.update = function(){
  
};

Node.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};