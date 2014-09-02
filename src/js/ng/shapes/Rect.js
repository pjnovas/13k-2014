
$.Rect = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //size: { x: 20, y: 20},
  //fill: null,
  //stroke: null,
  //corner: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.rect(ctx, this);
  },

});
