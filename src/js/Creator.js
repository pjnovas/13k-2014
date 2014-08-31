
$.Creator = $.Base.extend({}, {

  getSprites: function(){
    var sprites = $.sprites
      , gen = this.generate;

    return {
      bg: gen(sprites.bg, sprites.bgColor, true, 1),
      spider: gen(sprites.spider, sprites.color, true, 3),
      favicon: gen(sprites.spider, sprites.color, true, 1, 1, true),
      elements: gen(sprites.elements, sprites.colors),
      vacuum: this.drawPath(sprites.vacuum)
    };
  },

  generate: function(sprite, _color, multiple, _phases, bSize, url){
    var img = new window.Image();
    var phases = multiple ? _phases : sprite.length;
    
    var canvas = document.createElement('canvas');
    
    var lh = multiple ? sprite.length : sprite[0].length;
    var lw = multiple ? sprite[0].length: sprite[0][0].length;
    
    var pw = bSize || 2, ph = bSize || 2;
    
    var w = pw*lh; 
    var h = ph*lw;
    
    canvas.width = w*phases;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    
    for( var k = 0; k < phases; k++){
      for( var y = 0; y < lh; y++ ) {
        for( var x = 0; x < lw; x++ ) {
          var v, sp, c;

          if (multiple){
            v = sprite[y][x];
            c = (_color.indexOf("rgb") > -1 ? _color : "#" + _color);
            sp = k+2;
          }
          else {
            v = sprite[k][y][x];
            c = "#" + _color[k][v];
            sp = k;
          }

          if (
            (multiple && (
                (v===5 && (sp===2 || sp===3)) ||
                (v===6 && (sp===3 || sp===4)) ||
                (v===7 && (sp===2 || sp===4)) ||
                (v===1 || v===sp))
              ) ||
            (!multiple && v) 
          ){
            ctx.save();
            ctx.fillStyle = c;
            ctx.fillRect( (x*pw) + w*k, y*ph, pw, ph );
            ctx.restore();
          }
        }
      }
    }

    if (url){
      return canvas.toDataURL();
    }
    
    img.src = canvas.toDataURL("image/png");
    canvas = null;

    return img;
  },

  drawPath: function(opts){
    var img = new window.Image();

    var path = opts.path
      , fill = opts.fill
      , stroke = opts.stroke
      , line = opts.line
      , size = opts.size;

    var canvas = document.createElement('canvas');
    
    canvas.width = size.x;
    canvas.height = size.y;

    var ctx = canvas.getContext("2d");

    ctx.beginPath();

    var first = path[0];
    ctx.moveTo(first[0], first[1]);

    for (var i=1; i<path.length; i++){
      var p = path[i];
      if (p.length === 4){
        ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
      }
      else {
        ctx.lineTo(p[0], p[1]);
      }
    }

    ctx.lineTo(first[0], first[1]);

    if (fill){
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.lineWidth = line;
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.closePath();

    $.Renderer.rect(ctx, opts.box);

    img.src = canvas.toDataURL("image/png");
    canvas = null;

    return img;
  }

});
