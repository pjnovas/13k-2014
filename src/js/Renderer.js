
var Renderer = {};

//Renderer.grads = [];

Renderer.drawCircle = function(ctx, ps){
  ctx.beginPath();
  ctx.arc(ps.pos.x, ps.pos.y, ps.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = ps.color;
  ctx.fill();
};

Renderer.drawLine = function(ctx, ps){
  var a = ps.from
    , b = ps.to;

  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);

  ctx.lineWidth = ps.size;
  ctx.strokeStyle = ps.color;
  ctx.stroke();
};
/*
Renderer.drawLinGradient = function(ctx, ps){
  var a = ps.from
    , b = ps.to
    , cA = ps.colorFrom
    , cB = ps.colorTo
    , gid = a.x +"."+ a.y +"."+ b.x +"."+ b.y +"."+ cA +"."+ cB
    , grad = Renderer.grads[gid];

  if (!grad){
    grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, cA);
    grad.addColorStop(1, cB);
    Renderer.grads[gid] = grad;
  }

  ctx.strokeStyle = grad;

  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);

  ctx.lineWidth = ps.size;
  ctx.stroke();
};
*/
Renderer.drawRect = function(ctx, ps){
  ctx.beginPath();
  
  ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
  ctx.fillStyle = ps.color || "yellow";
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
};

module.exports = Renderer;
