
$.Vacuum = $.Entity.extend({

  targetLen: 0,

  start: function(options){
    this.target = options.target;
    this.size = config.vacuum.size;

    this.current = 0;

    this.offx = 30;
    this.offy = 10;

    this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
    this.recipeSize = { x: 80, y: 300 };

    this.createGraphics();
  },

  createGraphics: function(){
    var size = $.sprites.vacuum.size;

    this.bgBack = new $.Sprite({
      resource: "vacuum",
      pos: $.V.center({ x: this.offx, y: this.offy }, size),
      size: size
    });

    var c = [187,187,249];

    var opts = {
      pos: this.recipePos,
      size: this.recipeSize,
      corner: 6,
      fill: $.C.white,
      stroke: {
        size: 2,
        color: c
      }
    };

    this.cilinder = new $.Rect(opts);

    opts.fill = [0,0,255,0.5];
    this.glass = new $.Rect(opts);

    this.stats = new $.Text({
      pos: { x: 180, y: 30 },
      size: 25,
      color: "#00ff00"
    });

  },

  update: function(){
    this.current = this.target.saved.length;

    var p = this.recipePos
      , s = this.recipeSize
      , centerY = p.y + (s.y/2)
      , centerX = p.x + (s.x/2)
      , sinTime = $.tm * 2 * Math.PI;

    this.target.saved.forEach(function(spider){

      if (!spider.inVacuum){
        spider.inVacuum = true;
        
        spider.vacuum = {
          ampY: $.M.rnd(10, centerY/2),
          velY: $.M.rnd(600, 1000),
          ampX: $.M.rnd(5, 20),
          velX: $.M.rnd(2000, 6000),
          rot: $.M.rnd(1, 5)/10
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
    
    this.stats.text = _.pad(this.current, 2) + " / " + _.pad(this.targetLen, 2);
  },

  draw: function(ctx){
    this.bgBack.draw(ctx);
    
    this.cilinder.draw(ctx);
    
    this.target.saved.forEach(function(spider){
      spider.draw(ctx);
    });

    this.glass.draw(ctx);
    this.stats.draw(ctx);
  },

});
