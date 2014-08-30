
$.M = $.Base.extend({ }, {

  rnd: function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  rnd01: function(){
    return Math.random();
  },

  rnd11: function(){
    return Math.random() > 0.5 ? 1 : -1;
  },

  rndInCircle: function(radius){
    var angle = Math.random() * Math.PI * 2;
    var rad = $.M.rnd(0, radius);

    return {
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad
    };
  },

  lerp: function(a, b, u) {
    return (1 - u) * a + u * b;
  },

  polygonPoints: function(center, radius, sides) {
    var points = [];
    var angle = (Math.PI * 2) / sides;

    for (var i = 0; i < sides; i++) {
      points.push({
        x: center.x + radius * Math.cos(i * angle),
        y: center.y + radius * Math.sin(i * angle)
      });
    }

    return points;
  },

});

