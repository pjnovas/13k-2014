

module.exports = ng.Circle.extend({

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

    this.pos = ng.Vector.prod(ng.Vector.one, cfg.size);
    this.pos.x -= cfgm.x + 10;
    this.pos.y -= cfgm.y + 20;
    
    this.saved = [];
    this.saving = [];
  },

  setNodesInside: function(nodes){
    nodes.forEach(function(node){
      if (ng.Vector.pointInCircle(node.pos, this.pos, this.size)){
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
      if (!spider.dead && !spider.exited){

        if (ng.Vector.pointInCircle(spider.pos, this.pos, this.size)){
          spider.building = false;
          spider.exited = true;
          spider.vel = { x: 0, y: 0 };
          this.saving.push(spider);
        }
      }
    }, this);

    var dt = Time.deltaTime
      , force = dt * this.suckForce
      , p = this.pos;

    this.saving.forEach(function(spider){

      if (!spider.catched){
        var sp = spider.pos;
        var imp = ng.Vector.normal(sp, p);
        spider.vel = ng.Vector.add(spider.vel, ng.Vector.multiply(imp, force)); 
        spider.pos = ng.Vector.add(sp, spider.vel);
        
        if (ng.Vector.pointInCircle(spider.pos, p, 5)){
          spider.catched = true;
          this.saved.push(spider);
        }
      }

    }, this); 

  }

});
