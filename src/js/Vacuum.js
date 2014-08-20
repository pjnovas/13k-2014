
var Vacuum = module.exports = function(){
  
  this.size = 128;

  var marginW = config.world.margin.x;
  var marginH = config.world.margin.y;

  this.pos = Vector.prod(config.target.pos, config.size);
  this.pos.x -= marginW + this.size;
  this.pos.y -= marginH + this.size;
  
  this.color = config.target.color;
  this.dColor = Color.toRGBA(this.color);

  this.tubePos = { x: this.pos.x + this.size/1.25, y: this.pos.y + 30 };
};

Vacuum.prototype.update = function(){

};

Vacuum.prototype.draw = function(ctx){
  
  var offx = 30
    , offy = 10
    , tunnel = [ [0,135], [120,100], [120,120], [90,135] ]
    , tube = [ [120,120], [180,120], [180,100], [230,100], [230,135], [90,135] ]
    , cilindre = [ [150,100], [150,10], [260,10], [260,100] ];


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