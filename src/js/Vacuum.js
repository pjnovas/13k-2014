
var Vacuum = module.exports = function(){
  this.size = config.vacuum.size;

  // Text
  this.txtColor = "#fff";
  this.txtSize = 20;
  this.txtPos = { x: 180, y: 30 };

  this.targetLen = 20;
  this.current = 0;
};

Vacuum.prototype.update = function(){
  
};

Vacuum.prototype.draw = function(ctx){
  this.drawBG(ctx);
  this.drawSpiders(ctx);
  this.drawGlass(ctx);
  this.drawStats(ctx);
};

Vacuum.prototype.drawGlass = function(/*ctx*/){
  
};

Vacuum.prototype.drawSpiders = function(/*ctx*/){
  
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
  
  var offx = 30
    , offy = 10
    , tunnel = [ [0,480], [120,400], [160,450], [160,480] ]
    , tube = [ [160,450], [185,450], [185,380], [225,380], [225,480], [160,480] ]
    , cilindre = [ [150,380], [150,50], [260,50], [260,380] ];


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

    ctx.lineWidth = 2;
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.closePath();
  }

  drawPath(tunnel, '#000', '#fff');
  drawPath(tube, '#000', '#fff');
  drawPath(cilindre, '#000', '#fff');

};