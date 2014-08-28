
module.exports = ng.Collection.extend({

  pos: { x: 20, y: 50},

  start: function(){
    this.entities = [];

    this.current = "fire";
    this.active = false;

    this.keys = ["Q", "W", "E", "R"];
    this.elements = ["fire", "water", "earth", "air"];

    this.sprites = {};
    for(var i=0;i<4;i++){
      this.sprites[this.elements[i]] = { x: i*32, y: 0, w: 32, h: 32 };
    }

    this.createElements();
  },

  createElements: function(){
    var gap = 50
      , size = 96;

    this.elements.forEach(function(ele, i){

      this.entities.push(new prefabs.Element({
        pos: { x: this.pos.x, y: this.pos.y + (i * (size + gap)) },
        name: ele,
        key: this.keys[i],
        sprite: this.sprites[ele]
      }));

    }, this);
  },

  update: function(){
    var isActive = this.active
      , current = this.current;

    this.entities.forEach(function(e){
      e.active = e.current = false;
      if (e.name === current){
        e.current = true;
        e.active = isActive;
      }
      
      e.update();
    });
  },

});
