
var Stats = module.exports = function(){
  
  this.size = 40;

  var marginW = 15;
  var marginH = 25;

  this.pos = Vector.prod(config.stats.pos, config.size);

  this.kPos = Vector.clone(this.pos);
  this.kPos.x -= marginW + this.size/2;
  this.kPos.y += marginH + this.size;

  this.aPos = Vector.clone(this.pos);
  this.aPos.x -= marginW + this.size/2;
  this.aPos.y += marginH*3 + this.size;
  
  this.kcolor = Color.toRGBA(config.stats.colors.kills);
  this.acolor = Color.toRGBA(config.stats.colors.alives);

  this.stats = {
    saved: 0,
    killed: 0,
    alives: 0,
    total: 0
  };

  this.spSize = Vector.multiply(Vector.one, this.size);
  this.angle = Math.PI / 2;

  this.oAPos = Vector.origin(this.aPos, this.spSize);
  this.oKPos = Vector.origin(this.kPos, this.spSize);
  this.txtSize = 30;
};

Stats.prototype.set = function(stats){
  this.stats = stats;
};

Stats.prototype.update = function(){

};

Stats.prototype.draw = function(ctx){
  this.drawIcons(ctx);
  this.drawStats(ctx);
};

Stats.prototype.drawIcons = function(ctx){
  var spSize = this.spSize;
  var kPos = this.oKPos;
  var aPos = this.oAPos;

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: aPos,
    size: spSize,
    angle: this.angle,
    sp: config.spiders.sprites.move[0]
  });

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: kPos,
    size: spSize,
    angle: this.angle,
    sp: config.spiders.sprites.move[0]
  });

  Renderer.drawLine(ctx, {
    from: kPos,
    to: Vector.add(spSize, kPos),
    size: 2,
    color: this.kcolor
  });

  Renderer.drawLine(ctx, {
    from: { x: kPos.x + spSize.x, y: kPos.y },
    to: { x: kPos.x, y: kPos.y + spSize.y },
    size: 2,
    color: this.kcolor
  });

};

Stats.prototype.drawStats = function(ctx){
  var txtSize = this.txtSize;

  Renderer.drawText(ctx, {
    text: _.pad(this.stats.alives, 3),
    pos: { x: this.aPos.x - txtSize*3, y: this.aPos.y },
    size: txtSize,
    color: this.acolor
  });

  Renderer.drawText(ctx, {
    text: _.pad(this.stats.killed, 3),
    pos: { x: this.kPos.x - txtSize*3, y: this.kPos.y},
    size: txtSize,
    color: this.kcolor
  });

};