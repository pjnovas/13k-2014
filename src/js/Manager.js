
$.Manager = $.Base.extend({

  start: function(){
    this.cursor = new $.Cursor();
    this.nodes = new $.Nodes();
    this.paths = new $.Paths();
    this.target = new $.Target();

    this.vacuum = new $.Vacuum({
      target: this.target
    });

    this.elements = new $.Elements();

    this.spiders = new $.Spiders({
      nodes: this.nodes
    });

    this.stats = new $.Stats();

    this.target.setNodesInside(this.nodes.getNodes());
  },

  update: function(){
    var cursor = this.cursor
      , nodes = this.nodes
      , spiders = this.spiders
      , elements = this.elements;

    cursor.update();

    elements.current = cursor.element;
    elements.active = cursor.active;

    nodes.applyPos = null;
    if (cursor.active){
      nodes.applyPos = cursor.pos;
      nodes.applyRatio = cursor.radius;
      nodes.element = cursor.element;
    }

    nodes.update();
    spiders.update();
    this.target.update(spiders.getSpiders());
    this.vacuum.update();
    this.stats.update(spiders.stats);

    elements.update();

    //Particles.update();
  },

  draw: function(viewCtx, worldCtx, vacuumCtx){
    var s = config.size;
    var vs = config.vacuum.size;

    viewCtx.clearRect(0, 0, s.x, s.y);
    worldCtx.clearRect(0, 0, s.x, s.y);
    vacuumCtx.clearRect(0, 0, vs.x, vs.y);

    this.cursor.draw(viewCtx);
    this.nodes.draw(worldCtx);
    this.spiders.draw(worldCtx);
    this.target.draw(worldCtx);

    this.vacuum.draw(vacuumCtx);
    this.stats.draw(viewCtx);
    this.elements.draw(viewCtx);

    //Particles.draw(viewCtx);
  }

});
