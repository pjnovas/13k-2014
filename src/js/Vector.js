
var Vector = {};

Vector.zero = { x: 0, y: 0 };
Vector.one = { x: 1, y: 1 };

Vector.prod = function(a, b){
  return { x: a.x * b.x, y: a.y * b.y };
};

Vector.multiply = function(vector, delta){
  return { x: vector.x * delta, y: vector.y * delta };
};

Vector.divide = function(vector, delta){
  return { x: vector.x / delta, y: vector.y / delta };
};

Vector.add = function(a, b){
  return { x: a.x + b.x, y: a.y + b.y };
};

Vector.dif = function(from, to){
  return { x: to.x - from.x, y: to.y - from.y };
};

// get "which" part of a point between 2 (i.e. 4th part)
Vector.part = function(from, to, which){
  return Vector.lerp(from, to, which/10);
};

Vector.angleTo = function(from, to){
  var p = Vector.dif(from, to);
  return Math.atan2(p.y, p.x);
};

// get mid point between 2
Vector.mid = function(from, to){
  return Vector.divide(Vector.add(from, to), 2);
};

Vector.eql = function(a, b){
  return (a.x === b.x && a.y === b.y);
};

Vector.normal = function(from, to){
  var d = Vector.dif(from, to);
  var l = Vector.length(from, to);

  return {
      x: d.x / l || 0
    , y: d.y / l || 0
  };
};

Vector.origin = function(pos, size){
  return {
      x: pos.x - size.x/2,
      y: pos.y - size.y/2,
  };
};

Vector.center = function(pos, size){
  return {
      x: pos.x + size.x/2,
      y: pos.y + size.y/2,
  };
};

Vector.length = function(a, b){
  var dif = Vector.dif(a, b);
  return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
};

Vector.pointInCircle = function(p, pos, radius){
  return Vector.length(p, pos) < radius;
};
/*
Vector.circleCollide = function(c1, c2){
  var dx = c1.x - c2.x
    , dy = c1.y - c2.y
    , dist = c1.r + c2.r;
 
  return (dx * dx + dy * dy <= dist * dist);
};
*/
Vector.lerp = function(from, to, t){

  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t
  };

};

Vector.round = function(v){
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  return v;
};

Vector.isOut = function(p, min, max){
  return (p.x < min.x || p.x > max.x || p.y < min.y || p.y > max.y);
};

Vector.debug = function(vec){
  console.log(vec.x + " : " + vec.y);
};

module.exports = Vector;
