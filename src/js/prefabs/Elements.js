
$.Elements = $.Collection.extend({

  pos: { x: 20, y: 50},
  size: 96,
  gap: 50,
  showKeys: true,

  start: function(){
    this.entities = [];

    this.current = "fire";
    this.active = false;

    this.keys = ["Q", "W", "E", "R"];
    this.elements = config.elements;

    this.sprites = {};
    for(var i=0;i<4;i++){
      this.sprites[this.elements[i]] = { x: i*32, y: 0, w: 32, h: 32 };
    }

    this.createElements();
  },

  createElements: function(){
    var size = this.size
      , gap = this.gap + size
      , p = this.pos
      , showKeys = this.showKeys;

    this.elements.forEach(function(ele, i){

      this.entities.push(new $.Element({
        pos: { x: p.x, y: p.y + (i * gap) },
        size: { x: size, y: size },
        name: ele,
        key: this.keys[i],
        sprite: this.sprites[ele],
        showKeys: showKeys
      }));

    }, this);
  },

  update: function(){
    this.entities.forEach(function(e){

      e.current = (e.name === this.current);
      e.active = (e.current && this.active);
      e.update();
      
    }, this);
  },

});
