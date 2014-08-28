
module.exports = ng.Entity.extend({

  pos: { x: 0, y: 0 },
  text: "",

  size: 1,
  color: ng.Color.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    ng.Renderer.drawText(ctx, {
      text: this.text,
      pos: this.pos,
      size: this.size,
      color: ng.Color.toRGBA(this.color)
    });

  },

});

