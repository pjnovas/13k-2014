
module.exports = Entity.extend({

  initialize: function(options){
    this.target = options.target;
    this.size = config.vacuum.size;

    this.targetLen = 20;
    this.current = 0;

    this.offx = 30;
    this.offy = 10;

    this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
    this.recipeSize = { x: 80, y: 300 };

    this.createGraphics();
  },

  createGraphics: function(){
    var cPos = { x: this.offx + 150, y: this.offy + 50 };

    this.bgBack = new Rect({
      pos: cPos,
      size: { x: 110, y: 330 },
      corner: 6,
      fill: [158,158,158],
      stroke: {
        color: [71,71,71],
        size: 2
      }
    });

    var c = [187,187,249];

    var opts = {
      pos: this.recipePos,
      size: this.recipeSize,
      corner: 6,
      fill: Color.white,
      stroke: {
        size: 2,
        color: c
      }
    };

    this.cilinder = new Rect(opts);

    opts.fill = [0,0,255,0.5];
    this.glass = new Rect(opts);

    this.stats = new Text({
      pos: { x: 180, y: 30 },
      size: 20,
      color: Color.white
    });

  },

  update: function(){
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
    
    this.stats.text = _.pad(this.current, 3) + " / " + _.pad(this.targetLen, 3);
  },

  draw: function(ctx){
    this.drawBG(ctx);
    
    this.cilinder.draw(ctx);
    
    this.target.saved.forEach(function(spider){
      spider.draw(ctx);
    });

    this.glass.draw(ctx);
    this.stats.draw(ctx);
  },

  drawBG: function(ctx){
    
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
    this.bgBack.draw(ctx);
  }

});
