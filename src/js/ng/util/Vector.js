
$.V = $.Base.extend({ }, {

  zero: { x: 0, y: 0 },
  one: { x: 1, y: 1 },

  clone: function(v){
    return { x: v.x, y: v.y };
  },

  prod: function(a, b){
    return { x: a.x * b.x, y: a.y * b.y };
  },

  multiply: function(vector, delta){
    return { x: vector.x * delta, y: vector.y * delta };
  },

  divide: function(vector, delta){
    return { x: vector.x / delta, y: vector.y / delta };
  },

  add: function(a, b){
    return { x: a.x + b.x, y: a.y + b.y };
  },

  dif: function(from, to){
    return { x: to.x - from.x, y: to.y - from.y };
  },

  // get "which" part of a point between 2 (i.e. 4th part)
  part: function(from, to, which){
    return $.V.lerp(from, to, which/10);
  },

  angleTo: function(from, to){
    var p = $.V.dif(from, to);
    return Math.atan2(p.y, p.x);
  },

  // get mid point between 2
  mid: function(from, to){
    return $.V.divide($.V.add(from, to), 2);
  },

  eql: function(a, b){
    return (a.x === b.x && a.y === b.y);
  },

  normal: function(from, to){
    var d = $.V.dif(from, to);
    var l = $.V.magnitude(from, to);

    return {
        x: d.x / l || 0
      , y: d.y / l || 0
    };
  },

  origin: function(pos, size){
    return {
        x: pos.x - size.x/2,
        y: pos.y - size.y/2,
    };
  },

  center: function(pos, size){
    return {
        x: pos.x + size.x/2,
        y: pos.y + size.y/2,
    };
  },

  magnitude: function(a, b){
    var dif = $.V.dif(a, b);
    return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
  },

  pointInCircle: function(p, pos, radius){
    return $.V.magnitude(p, pos) < radius;
  },
  
  lerp: function(from, to, t){

    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };

  },

  round: function(v){
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    return v;
  },

  isOut: function(p, min, max){
    return (p.x < min.x || p.x > max.x || p.y < min.y || p.y > max.y);
  }

});
