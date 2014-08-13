
var Node = module.exports = function(opts){
  this.id = Utils.guid("nodes");

  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";

  this.nears = [];
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
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