
$.Rect = $.Entity.extend({

  pos: { x: 0, y: 0 },
  size: { x: 20, y: 20},
  fill: null,
  //stroke: null,
  //corner: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      pos: this.pos,
      size: this.size,
    };

    if (this.stroke){
      opts.stroke = this.stroke;
      if (opts.stroke.color) {
        opts.stroke.color = $.C.toRGBA(opts.stroke.color);
      }
    }

    if (this.fill){
      opts.fill = $.C.toRGBA(this.fill);
    }

    if (this.corner){
      opts.corner = this.corner;
    }

    $.Renderer.drawRect(ctx, opts);

  },

});
