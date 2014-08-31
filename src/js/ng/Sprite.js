
$.Sprite = $.Entity.extend({

  resource: "",
  pos: { x: 0, y: 0 },
  //sprite: { x: 0, y: 0, w: 20, h: 20 },
  size: { x: 20, y: 20 },
  //angle: 0,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      resource: this.resource,
      pos: this.pos,
      size: this.size
    };

    if (this.sprite){
      opts.sp = this.sprite;
    }

    if (this.angle){
      opts.angle = this.angle;
    }

    $.Renderer.sprite(ctx, opts);

  },

});
