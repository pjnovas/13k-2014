
$.Circle = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //radius: 5,
  //fill:null,
  //stroke: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.circle(ctx, this);
  },

});
