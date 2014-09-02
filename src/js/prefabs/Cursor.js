
$.Cursor = $.Circle.extend({

  stroke: {
    color: "#fff",
    size: 2
  },

  active: false,
  element: "fire",
  last: "",

  start: function(){
    var self = this;

    Controls
      .on("pressing", function(pos){
        self.pos = pos;
        self.active = true;
      })
      .on("moving", function(pos){
        self.pos = pos;
      })
      .on("release", function(){
        self.active = false;
      })
      .on("element", function(element){
        self.element = element;
      });

    this.emiter = Particles.createEmitter(this, {
      max: 50,
      rate: 0.1,
      ratep: 2,
      life: 1,
      rad: 5,
      g: { x: 0, y: 0}
    });

    this.setEmitter();
  },

  setEmitter: function(){
    var size = this.active ? 10 : 5;
    var effects = [
          [ -100, [100,,,0.8] ]
        , [ 100, [75,180,240,0.8], [200,200,250,0.1] ]
        , [ 100, [165,140,80,0.8] ]
      ]
      , e = this.emiter.options
      , effect = effects[config.elements.indexOf(this.element)];

    function set(g, from, to){
      to = to || [10,10,10,0.1];
      e.g.y = g;
      e.cFrom = from;
      e.cTo = to;
      e.size = size;
    }

    this.last = this.element + ":" + this.active;

    if (effect){
      Particles.playEmiter(this);
      set.apply(null, effect);
      return;
    }

    Particles.stopEmiter(this);
  },

  update: function(){
    var element = this.element
      , idx = config.elements.indexOf(element)
      , alpha = 0.4
      , sizes = [20,20,20,50]
      , colors = [
          [255,,, alpha]
        , [75,180,240, alpha]
        , [165,140,80, alpha]
        , [,220,255, alpha]
      ];

    this.fill = colors[idx];
    this.radius = sizes[idx];

    if (this.last !== (element + ":" + this.active)){
      this.setEmitter();
    }
  }
  
});
