
var Path = module.exports = function(na, nb){
  this.na = na;
  this.nb = nb;

  this.size = config.paths.size;
  this.tBurn = 0.5;

  this.burned = false;
  this.heat = null;
};

Path.prototype.update = function(){
  var na = this.na
    , nb = this.nb
    , naT = na.temp
    , nbT = nb.temp
    , naC = na.color
    , nbC = this.nb.color;

  if (naT > 0){
    this.heat = {
      from: na.pos,
      to: Vector.round(Vector.lerp(na.pos, nb.pos, naT * 2 > 1 ? 1 : naT * 2 ))
    };
  }
  else if (nbT > 0){
    this.heat = {
      from: nb.pos,
      to: Vector.round(Vector.lerp(nb.pos, na.pos, nbT * 2 > 1 ? 1 : nbT * 2))
    };
  }

  if (naT > this.tBurn && nbT === 0){
    nb.burn();
  }
  else if (nbT > this.tBurn && naT === 0){
    na.burn();
  }

  if (Color.eql(naC,  nbC)){
    this.color = Color.toRGBA(naC);
  }
  else {
    this.color = Color.toRGBA(Color.lerp(naC, nbC, this.tBurn));
  }

  if (na.burned || nb.burned) {
    this.heat = null;
    this.burned = true;
    this.color = Color.toRGBA(config.nodes.colors.burned);
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