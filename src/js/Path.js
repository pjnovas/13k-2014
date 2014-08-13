
var Path = module.exports = function(opts){
  this.na = opts.na;
  this.nb = opts.nb;

  this.size = 2;
  this.color = "#fff";
};

Path.prototype.update = function(){
  
};

Path.prototype.draw = function(ctx){

  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

};