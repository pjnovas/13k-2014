
var Elements = module.exports = function(){
  this.size = 96;
  this.pos = { x: 20, y: 50};

  this.spSize = Vector.multiply(Vector.one, this.size);

  this.current = null;
  this.active = false;
  this.selected = {};

  this.keys = {
    fire: "Q",
    water: "W",
    earth: "E",
    air: "R"
  };
};

Elements.prototype.update = function(){
  this.selected.air = window.blowing;
  
  this.selected.fire = false;
  this.selected.water = false;
  this.selected.earth = false;

  if (this.current){
    this.selected[this.current] = true;
  }
};

Elements.prototype.draw = function(ctx){
  var elementsSP = config.elements.sprites
    , gap = 50
    , i = 0;

  for (var ele in elementsSP){      
    var pos = { x: this.pos.x, y: this.pos.y + (i * (this.size + gap)) };

    Renderer.drawRect(ctx, {
      pos: pos,
      size: this.spSize,
      corner: 8,
      fill: (this.selected[ele] ? "white" : "transparent"),
      stroke: (this.active && this.current === ele ? "red" : "gray"),
      strokeWidth: 5
    });

    Renderer.drawSprite(ctx, {
      resource: "elements",
      pos: pos,
      size: this.spSize,
      angle: 0,
      sp: elementsSP[ele]
    });

    var txtPos = { x: pos.x, y: pos.y + this.spSize.y * 1.1 };
    var txtSize = 20;

    Renderer.drawRect(ctx, {
      pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
      size: Vector.multiply(Vector.one, txtSize*2),
      corner: 4,
      fill: "gray",
      strokeWidth: 2
    });

    Renderer.drawText(ctx, {
      text: this.keys[ele],
      pos: txtPos,
      size: txtSize,
      color: "#fff"
    });

    i++;
  }

};
