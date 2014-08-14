
var Spider = module.exports = function(opts){

  this.pos = Vector.round(opts.pos);
  this.size = 10;
  this.color = "yellow";

  this.nodeFrom = null;
  this.nodeTo = null;
  this.startTime = null;
  this.journeyLength = null;

  this.speed = 0.05;
  this.traveling = false;
  this.collider = this.size * 3;
};

Spider.prototype.setNode = function(nodeFrom, nodeTo){
  this.nodeFrom = nodeFrom;
  this.nodeTo = nodeTo;

  this.startTime = Time.time;
  this.journeyLength = Vector.length(nodeFrom.pos, nodeTo.pos);
  this.traveling = true;
};

Spider.prototype.update = function(){
  if (!this.journeyLength){
    return;
  }

  var distCovered = (Time.time - this.startTime) * this.speed;
  var fracJourney = distCovered / this.journeyLength;
  
  if (fracJourney > 1) {
    this.traveling = false;
    return;
  }

  this.pos = Vector.round(Vector.lerp(this.nodeFrom.pos, this.nodeTo.pos, fracJourney));
};

Spider.prototype.draw = function(ctx){

  //debug collider
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.collider,
    color: "rgba(0,255,0,0.2)"
  });

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};