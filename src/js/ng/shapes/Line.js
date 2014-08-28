
module.exports = ng.Entity.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 1,
  color: ng.Color.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    ng.Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.to,
      size: this.size,
      color: ng.Color.toRGBA(this.color)
    });

  },

});

