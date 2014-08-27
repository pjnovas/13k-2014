
module.exports = psycho.Entity.extend({

  pos: { x: 0, y: 0 },
  text: "",

  size: 1,
  color: psycho.Color.white,
  
  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    psycho.Renderer.drawText(ctx, {
      text: this.text,
      pos: this.pos,
      size: this.size,
      color: psycho.Color.toRGBA(this.color)
    });

  },

});

