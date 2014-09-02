
$.Renderer = $.Base.extend({ }, {

  fill: function(ctx, ps){
    if (ps.fill){
      ctx.fillStyle = $.C.toRGBA(ps.fill);
      ctx.fill();
    }
  },

  stroke: function(ctx, ps){
    if (ps.stroke){
      ctx.lineWidth = ps.stroke.size || 1;
      ctx.strokeStyle = $.C.toRGBA(ps.stroke.color);
      ctx.stroke();
    }
  },

  _rect: function(ctx, ps){
    ctx.beginPath();
    ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  circle: function(ctx, ps){
    var start = (ps.angles && ps.angles.start) || 0,
      end = (ps.angles && ps.angles.end) || 2 * Math.PI;

    ctx.beginPath();

    if (ps.lineCap){
      ctx.lineCap = ps.lineCap;
    }

    ctx.arc(ps.pos.x, ps.pos.y, ps.radius, start, end, false);

    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  line: function(ctx, ps){
    var a = ps.pos
      , b = ps.to;

    ctx.beginPath();

    ctx.lineCap = 'round';

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.lineWidth = ps.size;
    ctx.strokeStyle = $.C.toRGBA(ps.color);
    ctx.stroke();
  },

  sprite: function(ctx, ps){
    var img = $.repo[ps.resource]
      , p = $.V.origin(ps.pos, ps.size)
      , x = p.x
      , y = p.y
      , w = ps.size.x
      , h = ps.size.y
      , sp = ps.sprite;

    function draw(){
      if (sp){
        ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, x, y, w, h);
      }
      else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    if (!isNaN(ps.angle)){
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
  },

  text: function(ctx, ps){
    ctx.font = ps.size + 'pt Arial';
    ctx.textBaseline = ps.baseline || 'middle';
    ctx.fillStyle = $.C.toRGBA(ps.color);

    ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
  },

  rect: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , w = ps.size.x
      , h = ps.size.y;

    if (!ps.corner){
      $.Renderer.rect(ctx, ps);
      return;
    }

    var c = ps.corner;

    ctx.beginPath();
    ctx.moveTo(x + c, y);
    ctx.lineTo(x + w - c, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + c);
    ctx.lineTo(x + w, y + h - c);
    ctx.quadraticCurveTo(x + w, y + h, x + w - c, y + h);
    ctx.lineTo(x + c, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - c);
    ctx.lineTo(x, y + c);
    ctx.quadraticCurveTo(x, y, x + c, y);
    ctx.closePath();
    
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  }

});
