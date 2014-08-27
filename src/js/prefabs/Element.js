
module.exports = Entity.extend({

  size: { x: 96, y: 96 },

  initialize: function(options){
    this.name = options.name;
    this.key = options.key;
    this.color = [255,255,255,1];
    this.sprite = options.sprite;

    this.active = false;
    this.current = false;

    this.createElement();
  },

  createElement: function(){
    
    this.bg = new Rect({
      pos: this.pos,
      size: this.size,
      fill: this.color,
      stroke: { size: 4, color: [30,30,30,1] },
      corner: 8
    });

    this.icon = new Sprite({
      resource: "elements",
      pos: Vector.center(this.pos, this.size),
      size: this.size,
      angle: 0,
      sprite: this.sprite
    });

    var txtPos = { x: this.pos.x, y: this.pos.y + this.size.y * 1.1 };
    var txtSize = 20;

    this.ctrlKey = new Rect({
      pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
      size: Vector.multiply(Vector.one, txtSize*2),
      fill: [0,0,0,1],
      corner: 4
    });

    this.txtKey = new Text({
      text: this.key,
      pos: txtPos,
      size: txtSize,
      color: [255,255,255,1]
    });
  },

  update: function(){
    this.bg.fill = this.active ? [255,255,255,1] : [255,255,255, 0.1];
    this.bg.stroke.color = this.current ? [255,255,255,1] : [0,0,0,1];
  },

  draw: function(ctx){
    this.bg.draw(ctx);
    this.icon.draw(ctx);
    this.ctrlKey.draw(ctx);
    this.txtKey.draw(ctx);
  },

});
