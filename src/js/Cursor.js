
var Cursor = module.exports = function(){
  this.pos = { x: 0, y: 0 };

  this.active = false;
  this.element = "fire";
  this.color = [255,255,255,0.5];

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
  var elements = ["fire", "water", "earth", "air"]
    , alpha = 0.4
    , sizes = [20,20,20,50]
    , colors = [
        [255,0,0, alpha]
      , [0,0,255, alpha]
      , [165,140,80, alpha]
      , [0,220,255, alpha]
    ];

  this.color = colors[elements.indexOf(this.element)];
  this.size = sizes[elements.indexOf(this.element)];
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