
module.exports = ng.Entity.extend({

  pos: { x: 0, y: 0 },
  radius: 5,
  stroke: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      pos: this.pos,
      radius: this.radius,
      lineCap: this.lineCap || 'butt'
    };

    if (this.color){
      opts.fill = ng.Color.toRGBA(this.color);
    }

    if (this.stroke){
      opts.stroke = this.stroke;
    }

    if (this.angles){
      opts.angles = this.angles;
    }

    ng.Renderer.drawCircle(ctx, opts);
  },

});
