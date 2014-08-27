
module.exports = psycho.Entity.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 1,
  color: psycho.Color.white,
  
  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    psycho.Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.to,
      size: this.size,
      color: psycho.Color.toRGBA(this.color)
    });

  },

});

