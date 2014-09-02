
$.Text = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //text: "",

  //size: 1,
  color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.text(ctx, this);
  },

});

