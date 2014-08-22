
var Cursor = module.exports = function(){
  this.pos = { x: 0, y: 0 };
  
  this.normalSize = 20;
  this.airSize = 50;

  this.size = this.normalSize;

  this.coldColor = [0,0,255,0.5];
  this.burnColor = [255,0,0,0.4];
  this.earthColor = [165,140,80,0.4];
  this.airColor = [0,220,255,0.4];

  this.color = [255,255,255,0.5];

  this.active = false;
  this.element = "fire";

  Controls.on("pressing", this.onPressing.bind(this));
  Controls.on("moving", this.onMoving.bind(this));
  Controls.on("release", this.onRelease.bind(this));
  Controls.on("element", this.onElement.bind(this));
};

Cursor.prototype.onPressing = function(pos){
  this.pos = pos;
  this.active = true;
};

Cursor.prototype.onMoving = function(pos){
  this.pos = pos;
};

Cursor.prototype.onRelease = function(){
  this.active = false;
};

Cursor.prototype.onElement = function(element){
  this.element = element;
};

Cursor.prototype.update = function(){
  this.size = this.normalSize;

  switch(this.element){
    case "fire":
      this.color = this.burnColor;
      break;
    case "water":
      this.color = this.coldColor;
      break;
    case "earth":
      this.color = this.earthColor;
      break;
    case "air":
      this.color = this.airColor;
      this.size = this.airSize;
      break;
  }
};

Cursor.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color),
    stroke: {
      color: "#fff",
      size: 2
    } 
  });

};