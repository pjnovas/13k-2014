
$.Target = $.Circle.extend({

  stroke: {
    color: [80,255,85,0.1]
  },
  angles: {
    start: 0.97 * Math.PI,
    end: 1.52 * Math.PI
  },
  lineCap: 'butt',
  
  suckForce: 3,

  start: function(){
    var cfg = config
      , cfgm = cfg.world.margin;

    this.size = cfg.size.y/6;
    this.radius = this.size/2;
    this.stroke.size = this.size;

    this.pos = $.V.prod($.V.one, cfg.size);
    this.pos.x -= cfgm.x + 10;
    this.pos.y -= cfgm.y + 20;
    
    this.saved = [];
    this.saving = [];

    var emitter = new $.Entity({
      pos: { x: this.pos.x - 100, y: this.pos.y - 100 }
    });

    var g = $.V.normal(emitter.pos, this.pos);

    Particles.createEmitter(emitter, {
      auto: true,
      max: 10,
      rate: 0.5,
      ratep: 1,
      life: 1,
      rad: 50,
      size: 2,
      cFrom: [200,200,200,0.5],
      cTo: [200,200,200,0.1],
      g: $.V.multiply(g, 150)
    });
  },

  setNodesInside: function(nodes){
    nodes.forEach(function(node){
      if ($.V.pointInCircle(node.pos, this.pos, this.size)){
        if (node.burned){
          node.burned = false;
          node.revive();
        }
        node.insideTarget = true;
      }
    }, this);
  },

  update: function(spiders){

    spiders.forEach(function(spider){
      if (!spider.burning && !spider.dead && !spider.exited){

        if ($.V.pointInCircle(spider.pos, this.pos, this.size)){
          spider.building = false;
          spider.exited = true;
          spider.vel = { x: 0, y: 0 };
          this.saving.push(spider);
        }
      }
    }, this);

    var force = $.dt * this.suckForce
      , p = this.pos;

    this.saving.forEach(function(spider){

      if (!spider.catched){
        var sp = spider.pos;
        var imp = $.V.normal(sp, p);
        spider.vel = $.V.add(spider.vel, $.V.multiply(imp, force)); 
        spider.pos = $.V.add(sp, spider.vel);
        
        if ($.V.pointInCircle(spider.pos, p, 5)){
          spider.catched = true;
          this.saved.push(spider);
        }
      }

    }, this); 

  }

});
