
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

  //TODO: Update spider animation inside the Vacuum

  var margin = 15;
  this.target.saved.forEach(function(spider){
    if (!spider.inVacuum){
      spider.inVacuum = true;
      spider.pos = { 
        x: Mathf.rnd(this.recipePos.x + margin, this.recipePos.x + this.recipeSize.x - margin), 
        y: Mathf.rnd(this.recipePos.y + margin, this.recipePos.y + this.recipeSize.y - margin)
      };
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
    , tunnel = [ [0,480], [120,400], [160,450], [160,480] ]
    , tube = [ [160,450], [185,450], [185,380], [225,380], [225,480], [160,480] ];

  function drawPath(path, fill, stroke){
    ctx.beginPath();

    var first = path[0];
    ctx.moveTo(offx + first[0], offy + first[1]);

    for (var i=1; i<path.length; i++){
      ctx.lineTo(offx + path[i][0], offy + path[i][1]);
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

  drawPath(tunnel, '#9e9e9e', '#474747');
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