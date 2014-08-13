
var Node = module.exports = function(opts){
  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";
};

Node.prototype.update = function(){
  
};

Node.prototype.draw = function(ctx){

  Renderer.drawLine(ctx, {
    from: this.pos,
    radius: this.size,
    color: this.color
  });

};