
$.Renderer = $.Base.extend({ }, {

  fill: function(ctx, ps){
    if (ps.hasOwnProperty("fill")){
      ctx.fillStyle = ps.fill;
      ctx.fill();
    }
  },

  stroke: function(ctx, ps){
    if (ps.hasOwnProperty("stroke")){
      ctx.lineWidth = ps.strokeWidth || ps.stroke.size || 1;

      var strokeColor = ps.stroke.color || ps.stroke || "#000";
      ctx.strokeStyle = Array.isArray(strokeColor) ? $.C.toRGBA(strokeColor) : strokeColor;
      ctx.stroke();
    }
  },

  _drawRect: function(ctx, ps){
    ctx.beginPath();
    ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  drawCircle: function(ctx, ps){
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

  drawLine: function(ctx, ps){
    var a = ps.from
      , b = ps.to;

    ctx.beginPath();

    ctx.lineCap = 'round';

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.lineWidth = ps.size;
    ctx.strokeStyle = ps.color;
    ctx.stroke();
  },

  drawSprite: function(ctx, ps){
    var img = $.repo[ps.resource]
      , p = $.V.origin(ps.pos, ps.size)
      , x = p.x
      , y = p.y
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
  },
/*
  drawTextWrap: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , maxWidth = ps.width
      , lineHeight = ps.lineHeight
      , text = ps.text;

    var words = text.split(' ');
    var line = '';

    for(var n = 0; n < words.length; n++) {
      var testLine = line + words[n] + ' ';
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      }
      else {
        line = testLine;
      }
    }

    ctx.fillText(line, x, y);
  },
*/
  drawText: function(ctx, ps){
    ctx.font = ps.size + 'pt Arial';
    ctx.textBaseline = ps.baseline || 'middle';
    ctx.fillStyle = ps.color;
/*
    if (ps.wrap){
      this.drawTextWrap(ctx, ps);
      return;
    }
*/
    ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
  },

  drawRect: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , w = ps.size.x
      , h = ps.size.y;

    if (!ps.hasOwnProperty("corner")){
      $.Renderer._drawRect(ctx, ps);
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
