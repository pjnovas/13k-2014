
var Mathf = {};

Mathf.rnd = function(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};
/*
Mathf.rnd11 = function(){
  return Math.round(Math.random());
};

Mathf.rnd01 = function(){
  return Math.random();
};
*/
Mathf.rndAngle = function(){
  return Math.random() * Math.PI * 2;
};

Mathf.rndInCircle = function(radius){
  var angle = Mathf.rndAngle();
  var rad = Mathf.rnd(0, radius);

  return {
    x: Math.cos(angle) * rad,
    y: Math.sin(angle) * rad
  };
};

Mathf.lerp = function(a, b, u) {
  return (1 - u) * a + u * b;
};

Mathf.polygonPoints = function(center, radius, sides) {
  var points = [];
  var angle = (Math.PI * 2) / sides;

  for (var i = 0; i < sides; i++) {
    points.push({
      x: center.x + radius * Math.cos(i * angle),
      y: center.y + radius * Math.sin(i * angle)
    });
  }

  return points;
};

module.exports = Mathf;
