
var Cursor = module.exports = function(){
  this.pos = { x: 0, y: 0 };
  this.size = 20;

  this.coldColor = [0,0,255,0.5];
  this.burnColor = [255,0,0,0.4];

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
  switch(this.element){
    case "fire":
      this.color = this.burnColor;
      break;
    case "water":
      this.color = this.coldColor;
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