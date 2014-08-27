
module.exports = Entity.extend({

  pos: { x: 0, y: 0 },
  text: "",

  size: 1,
  color: Color.white,
  
  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    Renderer.drawText(ctx, {
      text: this.text,
      pos: this.pos,
      size: this.size,
      color: Color.toRGBA(this.color)
    });

  },

});

