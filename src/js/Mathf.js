
var Mathf = {};

Mathf.random = function(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};

Mathf.random11 = function(){
  return Math.round(Math.random());
};

Mathf.random01 = function(){
  return Math.random();
};

Mathf.randomAngle = function(){
  return Math.random() * Math.PI * 2;
};

Mathf.randomInCircle = function(radius){
  var angle = Mathf.randomAngle();
  var rad = Mathf.random(0, radius);

  return {
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad
  };
};

module.exports = Mathf;
