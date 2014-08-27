
var Element = require("./Element");

module.exports = Collection.extend({

  pos: { x: 20, y: 50},

  initialize: function(){
    this.entities = [];

    this.current = "fire";
    this.active = false;

    this.keys = ["Q", "W", "E", "R"];
    this.elements = ["fire", "water", "earth", "air"];

    this.createElements();
  },

  createElements: function(){
    var gap = 50
      , size = 96;

    this.elements.forEach(function(ele, i){

      this.entities.push(new Element({
        pos: { x: this.pos.x, y: this.pos.y + (i * (size + gap)) },
        name: ele,
        key: this.keys[i],
        sprite: config.elements.sprites[ele]
      }));

    }, this);
  },

  update: function(){
    var isActive = this.active
      , current = this.current;

    this.entities.forEach(function(e){
      e.current = false;
      e.active = false;
      if (e.name === current){
        e.current = true;
        e.active = isActive;
      }
      
      e.update();
    });
  },

});
