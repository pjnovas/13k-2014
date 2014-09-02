
$.Text = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //text: "",

  //size: 1,
  color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      text: this.text,
      pos: this.pos,
      size: this.size,
      color: $.C.toRGBA(this.color)
    };

    $.Renderer.text(ctx, opts);
  },

});

