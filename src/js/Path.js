
var Path = module.exports = function(opts){
  this.a = opts.a;
  this.b = opts.b;

  this.size = 2;
  this.color = "#fff";
};

Path.prototype.update = function(){
  
};

Path.prototype.draw = function(ctx){

  Renderer.drawLine(ctx, {
    from: this.a,
    to: this.b,
    size: this.size,
    color: this.color
  });

};