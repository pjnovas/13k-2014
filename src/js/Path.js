
var Path = module.exports = function(na, nb){
  this.na = na;
  this.nb = nb;

  this.size = config.paths.size;
  this.tBurn = 0.5; //config.paths.tBurn;

  this.burned = false;
  this.heat = null;
};

Path.prototype.update = function(){
  var naT = this.na.temp
    , nbT = this.nb.temp
    , naC = this.na.color
    , nbC = this.nb.color;

  if (naT > 0){
    this.heat = {
      from: this.na.pos,
      to: Vector.round(Vector.lerp(this.na.pos, this.nb.pos, naT * 2 > 1 ? 1 : naT * 2 ))
    };
  }
  else if (nbT > 0){
    this.heat = {
      from: this.nb.pos,
      to: Vector.round(Vector.lerp(this.nb.pos, this.na.pos, nbT * 2 > 1 ? 1 : nbT * 2))
    };
  }

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
    this.heat = null;
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

  if (this.heat){
    Renderer.drawLine(ctx, {
      from: this.heat.from,
      to: this.heat.to,
      size: 5,
      color: "rgba(255,0,0,0.4)"
    });
  }
  

};