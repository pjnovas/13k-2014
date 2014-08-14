
var Path = module.exports = function(opts){
  this.na = opts.na;
  this.nb = opts.nb;

  this.size = 2;

  this.burned = false;
};

Path.prototype.update = function(){
  if (this.burned){
    return;
  }

  this.burned = (this.na.burned || this.nb.burned);
  if (this.burned){
    return;
  }

  var naT = this.na.temp;
  var nbT = this.nb.temp;

  if (naT > 0.5 && nbT === 0){
    this.nb.burn();
  }
  else if (nbT > 0.5 && naT === 0){
    this.na.burn();
  }

  if (Color.eql(this.na.color,  this.nb.color)){
    this.color = Color.toRGBA(this.na.color);
  }
  else {
    this.color = Color.toRGBA(Color.lerp(this.na.color, this.nb.color, 0.5));
  }

};

Path.prototype.draw = function(ctx){
  if (this.burned){
    return;
  }

  //if (Color.eql(this.na.color,  this.nb.color)){
  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

  /*
  else { toooooo expensive (blows in Mozilla)
    Renderer.drawLinGradient(ctx, {
      from: this.na.pos,
      to: this.nb.pos,
      size: this.size,
      colorFrom: Color.toRGBA(this.na.color),
      colorTo: Color.toRGBA(this.nb.color)
    });
  }
  */

};