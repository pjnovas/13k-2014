
$.Element = $.Collection.extend({

  size: { x: 96, y: 96 },

  start: function(/*options*/){
    this.entities = [];

    //this.name = options.name;
    //this.key = options.key;
    //this.showKeys = options.showKeys;
    //this.sprite = options.sprite;

    this.active = false;
    this.current = false;

    this.createElement();
  },

  createElement: function(){
    var size = this.size,
      pos = this.pos;
    
    this.bg = new $.Rect({
      pos: pos,
      size: size,
      fill: [255,255,255, 0.1],
      stroke: { size: 4, color: [30,30,30,1] },
      corner: 8
    });
    this.entities.push(this.bg);

    this.icon = new $.Sprite({
      resource: "elements",
      pos: $.V.center({ x: pos.x+3, y: pos.y+6 }, { x: size.x-6, y: size.y-6 }),
      size: size,
      angle: 0,
      sprite: this.sprite
    });
    this.entities.push(this.icon);

    var txtPos = { x: pos.x, y: pos.y + size.y * 1.1 };
    var txtSize = 20;

    if (this.showKeys){

      this.ctrlKey = new $.Rect({
        pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
        size: $.V.multiply($.V.one, txtSize*2),
        fill: [,,,1],
        corner: 4
      });
      this.entities.push(this.ctrlKey);

      this.txtKey = new $.Text({
        text: this.key,
        pos: txtPos,
        size: txtSize,
        color: $.C.white
      });
      this.entities.push(this.txtKey);
    }
  },

  update: function(){
    this.bg.fill = [255,255,255, this.active ? 1 : 0.1];
    this.bg.stroke.color = this.current ? $.C.white : [,,,1];
  },

});
