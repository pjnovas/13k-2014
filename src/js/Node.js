
var Node = module.exports = function(opts){
  this.id = Utils.guid("nodes");

  this.row = opts.row;
  this.col = opts.col;

  this.pos = opts.pos;
  this.size = opts.size;

  this.coldColor = [255,255,255,1];
  this.burnColor = [255,0,0,1];

  this.color = this.coldColor;

  this.nears = [];
  this.selected = false;

  this.increaseTempSize = 0.1;

  this.temp = 0;
  this.increaseTemp = 0;
  this.burnTemp = 1;

  this.collider = 1;
  this.colliderTemp = 40;

  this.burned = false;
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
};

Node.prototype.burn = function(){
  this.increaseTemp = 1;
};

Node.prototype.cool = function(){
  this.increaseTemp = -1;
};

Node.prototype.getRandomNear = function(){
  var idx = Mathf.rnd(0, this.nears.length-1);
  return this.nears[idx];
};

Node.prototype.notifyBurn = function(){
  /*
  this.nears.forEach(function (node){
    node.burn();
  });
*/
};

Node.prototype.update = function(){

  if (this.burned){
    return;
  }

  this.temp += this.increaseTemp * this.increaseTempSize * Time.deltaTime;

  if (this.temp <= 0){
    this.temp = 0;
    //this.notifyCold();
  }

  this.color = Color.lerp(this.coldColor, this.burnColor, this.temp);

  if (this.temp > 1){
    this.burned = true;
    this.notifyBurn();
    return;
  }

  this.collider = this.temp ? this.temp * this.colliderTemp : 1 ;

};

Node.prototype.draw = function(ctx){

  if (this.burned){
    return;
  }
/*
  //debug collider
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.collider,
    color: "rgba(255,0,0,0.5)"
  });
*/

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color)
  });

};