
var Renderer = {};

Renderer.drawCircle = function(ctx, ps){
  ctx.beginPath();
  ctx.arc(ps.pos.x, ps.pos.y, ps.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = ps.color;
  ctx.fill();

  if (ps.stroke){
    ctx.lineWidth = ps.stroke.size || 1;
    ctx.strokeStyle = ps.stroke.color || "#000";
    ctx.stroke();
  }
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

Renderer.drawSprite = function(ctx, ps){
  var img = Repo[ps.resource]
    , x = ps.pos.x
    , y = ps.pos.y
    , w = ps.size.x
    , h = ps.size.y
    , sp = ps.sp;

  function draw(){
    if (sp){
      ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, x, y, w, h);
    }
    else {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  if (ps.hasOwnProperty("angle")){
    ctx.save();

    ctx.translate(x + w/2, y + h/2);
    x = -w/2;
    y = -h/2;
    ctx.rotate(ps.angle);

    draw();

    ctx.restore();
    return;
  }

  draw();
};

Renderer.drawText = function(ctx, ps){
  ctx.font = ps.size +  'pt Arial';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = ps.color;
  ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
};

Renderer.drawRect = function(ctx, ps){
  ctx.beginPath();
  
  ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);

  if (ps.hasOwnProperty("fill")){
    ctx.fillStyle = ps.fill;
    ctx.fill();
  }

  if (ps.hasOwnProperty("stroke")){
    ctx.lineWidth = ps.strokeWidth || 1;
    ctx.strokeStyle = ps.stroke;
    ctx.stroke();
  }
};

module.exports = Renderer;
