



var Vacuum = module.exports = function(target){
  this.target = target;
  this.size = config.vacuum.size;

  // Text
  this.txtColor = "#fff";
  this.txtSize = 20;
  this.txtPos = { x: 180, y: 30 };

  this.targetLen = 20;
  this.current = 0;

  this.offx = 30;
  this.offy = 10;

  this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
  this.recipeSize = { x: 80, y: 300 };
};

Vacuum.prototype.update = function(){
  this.current = this.target.saved.length;

  var p = this.recipePos
    , s = this.recipeSize
    , centerY = p.y + (s.y/2)
    , centerX = p.x + (s.x/2)
    , sinTime = Time.time * 2 * Math.PI;

  this.target.saved.forEach(function(spider){

    if (!spider.inVacuum){
      spider.inVacuum = true;
      
      spider.vacuum = {
        ampY: Mathf.rnd(10, centerY/2),
        velY: Mathf.rnd(600, 1000),
        ampX: Mathf.rnd(5, 20),
        velX: Mathf.rnd(2000, 6000),
        rot: Mathf.rnd(1, 5)/10
      };

      spider.pos = { 
        x: centerX,
        y: centerY
      };
    }
    else {
      spider.animate();

      var v = spider.vacuum;

      spider.pos = {
        x: v.ampX * Math.sin(sinTime / v.velX) + centerX,
        y: v.ampY * Math.sin(sinTime / v.velY) + centerY
      };

      spider.angle += v.rot;
    }

  }, this);
  
};

Vacuum.prototype.draw = function(ctx){
  this.drawBG(ctx);
  this.drawContent(ctx);
  this.drawStats(ctx);
};

Vacuum.prototype.drawContent = function(ctx){

  var cPos = this.recipePos;
  var recSize = this.recipeSize;

  Renderer.drawRect(ctx, {
    pos: cPos,
    size: recSize,
    corner: 6,
    fill: "#ffffff",
    strokeWidth: 2
  });

  this.drawSpiders(ctx);

  Renderer.drawRect(ctx, {
    pos: cPos,
    size: recSize,
    corner: 6,
    stroke: "#bbbbf9",
    fill: "rgba(0,0,255,0.5)",
    strokeWidth: 2
  });
};

Vacuum.prototype.drawSpiders = function(ctx){
  this.target.saved.forEach(function(spider){
    spider.draw(ctx);
  });
};

Vacuum.prototype.drawStats = function(ctx){
  var txtSize = this.txtSize;

  Renderer.drawText(ctx, {
    text: _.pad(this.current, 3) + " / " + _.pad(this.targetLen, 3),
    pos: this.txtPos,
    size: txtSize,
    color: this.txtColor
  });

};

Vacuum.prototype.drawBG = function(ctx){
  
  var offx = this.offx
    , offy = this.offy
    , tube = [ [70,460], [120,400], [160,445], [195,450, 185,380], [225,380], [230,510, 145,475] ];

  function drawPath(path, fill, stroke){
    ctx.beginPath();

    var first = path[0];
    ctx.moveTo(offx + first[0], offy + first[1]);

    for (var i=1; i<path.length; i++){
      var p = path[i];
      if (p.length === 4){
        ctx.quadraticCurveTo(offx + p[0], offy + p[1], offx + p[2], offy + p[3]);
      }
      else {
        ctx.lineTo(offx + p[0], offy + p[1]);
      }
    }

    ctx.lineTo(offx + first[0], offy + first[1]);

    if (fill){
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.closePath();
  }

  drawPath(tube, '#9e9e9e', '#474747');

  var cPos = { x: offx + 150, y: offy + 50 };
  Renderer.drawRect(ctx, {
    pos: cPos,
    size: { x: 110, y: 330 },
    corner: 6,
    fill: "#9e9e9e",
    stroke: "#474747",
    strokeWidth: 2
  });

};