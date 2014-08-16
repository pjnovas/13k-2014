
var Path = module.exports = function(na, nb){
  this.na = na;
  this.nb = nb;

  this.size = config.paths.size;
  this.tBurn = config.paths.tBurn;

  this.burned = false;
};

Path.prototype.update = function(){
  var naT = this.na.temp
    , nbT = this.nb.temp
    , naC = this.na.color
    , nbC = this.nb.color;

  if (naT > this.tBurn && nbT === 0){
    this.nb.burn();
  }
  else if (nbT > this.tBurn && naT === 0){
    this.na.burn();
  }

  if (Color.eql(naC,  nbC)){
    this.color = Color.toRGBA(naC);
  }
  else {
    this.color = Color.toRGBA(Color.lerp(naC, nbC, this.tBurn));
  }

  if (this.na.burned || this.nb.burned) {
    this.burned = true;
    this.color = Color.toRGBA(config.paths.colors.burned);
  }

};

Path.prototype.draw = function(ctx){
  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

};