
var Color = {};

Color.toRGBA = function(arr){
  return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + (arr[3] || 1) + ")";
};

Color.lerp = function(from, to, t){
  var fromA = from[3] === undefined ? 1 : from[3];
  var toA = to[3] === undefined ? 1 : to[3];

  var r = Math.round(Mathf.lerp(from[0], to[0], t));
  var g = Math.round(Mathf.lerp(from[1], to[1], t));
  var b = Math.round(Mathf.lerp(from[2], to[2], t));
  var a = Math.round(Mathf.lerp(fromA, toA, t) * 100) / 100;

  return [r,g,b,a];
};

Color.eql = function(a, b){
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

module.exports = Color;
