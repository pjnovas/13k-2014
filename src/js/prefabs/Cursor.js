
module.exports = psycho.Circle.extend({

  radius: 20,
  stroke: {
    color: "#fff",
    size: 2
  },

  active: false,
  element: "fire",

  initialize: function(){
    Controls.on("pressing", this.onPressing.bind(this));
    Controls.on("moving", this.onMoving.bind(this));
    Controls.on("release", this.onRelease.bind(this));
    Controls.on("element", this.onElement.bind(this));
  },

  onPressing: function(pos){
    this.pos = pos;
    this.active = true;
  },

  onMoving: function(pos){
    this.pos = pos;
  },

  onRelease: function(){
    this.active = false;
  },

  onElement: function(element){
    this.element = element;
  },

  update: function(){
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
    this.radius = sizes[elements.indexOf(this.element)];
  },

  //draw is used from inheritance by the Circle class

});
