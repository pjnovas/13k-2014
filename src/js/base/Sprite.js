
module.exports = Entity.extend({

  resource: "",
  pos: { x: 0, y: 0 },
  sprite: { x: 0, y: 0, w: 20, h: 20 },
  size: { x: 20, y: 20 },
  angle: 0,

  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    Renderer.drawSprite(ctx, {
      resource: "spider",
      pos: this.pos,
      size: this.size,
      angle: this.angle,
      sp: this.sprite
    });

  },

});
