
$.Line = $.Entity.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 1,
  color: $.Color.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    $.Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.to,
      size: this.size,
      color: $.Color.toRGBA(this.color)
    });

  },

});

