
var Spider = module.exports = function(opts){

  this.pos = opts.pos;
  this.size = 10;
  this.color = "yellow";

  this.nodeFrom = null;
  this.nodeTo = null;
  this.startTime = null;
  this.journeyLength = null;

  this.speed = 0.05;
  this.traveling = false;
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

  this.pos = Vector.lerp(this.nodeFrom.pos, this.nodeTo.pos, fracJourney);
};

Spider.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};