
$.Path = $.Line.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 2,

  tBurn: 0.5,
  burned: false,
  heat: null,

  setHeat: function(from, to, t){
    var h = this.heat || {};
    h.from = from.pos;
    h.to = $.V.round($.V.lerp(from.pos, to.pos, t * 2 > 1 ? 1 : t * 2 ));
    this.heat = h;
  },

  update: function(){
    var na = this.na
      , nb = this.nb
      , naT = na.temp
      , nbT = nb.temp
      , naC = na.color
      , nbC = this.nb.color;

    if (naT > 0){
      this.setHeat(na, nb, naT);
    }
    else if (nbT > 0){
      this.setHeat(nb, na, nbT);
    }

    if (naT > this.tBurn && nbT === 0){
      nb.burn();
    }
    else if (nbT > this.tBurn && naT === 0){
      na.burn();
    }

    if ($.C.eql(naC,  nbC)){
      this.color = naC;
    }
    else {
      this.color = $.C.lerp(naC, nbC, this.tBurn);
    }

    if (na.burned || nb.burned) {
      this.heat = null;
      this.burned = true;
      this.color = [,,,0.5];
    }

    this.pos = this.na.pos;
    this.to = this.nb.pos;
  },

  draw: function(ctx){
    $.Path._super.draw.apply(this, arguments);

    if (this.heat){
      $.Renderer.drawLine(ctx, {
        from: this.heat.from,
        to: this.heat.to,
        size: 5,
        color: "rgba(255,0,0,0.4)"
      });
    }

  },

});
