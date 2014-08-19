
var Target = module.exports = function(pos){
  
  this.pos = pos;
  this.size = config.target.size;

  this.color = config.target.colors.cold;
  this.dColor = Color.toRGBA(this.color);

};

Target.prototype.update = function(){

  //TODO: Catch Spiders! 

};

Target.prototype.draw = function(ctx){
  
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.dColor
  });

};