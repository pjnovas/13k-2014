
$.Manager = $.Base.extend({

  level: 0,

  start: function(){
    Particles = new $.Particles();

    var lvl = config.levels[this.level];
    this.spidersAm = lvl[0];
    this.spidersWin = lvl[1];
    this.spidersKill = lvl[2];

    this.cursor = new $.Cursor();
    this.nodes = new $.Nodes();
    this.paths = new $.Paths();
    this.target = new $.Target();

    this.vacuum = new $.Vacuum({
      target: this.target,
      targetLen: this.spidersWin
    });

    this.elements = new $.Elements();

    this.spiders = new $.Spiders({
      nodes: this.nodes,
      amount: this.spidersAm
    });

    this.stats = new $.Stats({
      maxKills: this.spidersKill
    });

    this.target.setNodesInside(this.nodes.getNodes());

    this.pauseMsg = new $.Text({
      pos: { x: 10, y: config.size.y - 20 },
      text: "[P] Pause/Help",
      size: 15
    });
  },

  checkState: function(){
    var stat = this.stats.stats;

    if (stat.saved >= this.spidersWin){
      this.onEnd(stat, true);
    }
    
    if (stat.killed >= this.spidersKill){
      this.onEnd(stat, false);
    }
  },

  update: function(){
    var cursor = this.cursor
      , nodes = this.nodes
      , spiders = this.spiders
      , elements = this.elements;

    cursor.update();

    elements.current = cursor.element;
    elements.active = cursor.active;

    spiders.applyPos = nodes.applyPos = null;

    if (cursor.active){
      spiders.applyPos = nodes.applyPos = cursor.pos;
      spiders.applyRatio = nodes.applyRatio = cursor.radius;
      spiders.element = nodes.element = cursor.element;
    }

    nodes.update();
    spiders.update();
    this.target.update(spiders.getSpiders());
    this.vacuum.update();
    this.stats.update(spiders.stats);

    elements.update();

    Particles.update();

    this.checkState();
  },

  draw: function(viewCtx, worldCtx, vacuumCtx){
    var s = config.size;
    var vs = config.vacuum.size;

    viewCtx.clearRect(0, 0, s.x, s.y);
    worldCtx.clearRect(0, 0, s.x, s.y);
    vacuumCtx.clearRect(0, 0, vs.x, vs.y);

    Particles.draw(viewCtx);

    this.cursor.draw(viewCtx);
    this.nodes.draw(worldCtx);
    this.spiders.draw(worldCtx);
    this.target.draw(worldCtx);

    this.vacuum.draw(vacuumCtx);
    this.stats.draw(viewCtx);
    this.elements.draw(viewCtx);

    this.pauseMsg.draw(viewCtx);
  },

});
