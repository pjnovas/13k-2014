
module.exports = Entity.extend({

  pos: { x: 0, y: 0 },
  radius: 5,
  color: Color.white,
  stroke: null,

  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    Renderer.drawCircle(ctx, {
      pos: this.pos,
      radius: this.radius,
      color: Color.toRGBA(this.color),
      stroke: this.stroke
    });

  },

});
