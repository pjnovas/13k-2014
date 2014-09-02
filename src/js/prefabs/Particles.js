

$.Particles = $.Collection.extend({

  max: 250, //max particles in world

  start: function(){
    this.entities = [];
    this.emitters = {};

    this.init(this.max);
  },

  init: function(max){
    for (var i=0; i<max; i++){
      this.entities.push({
        active: false
      });
    }  
  },

  createEmitter: function(emitter, ops){
    var e = this.emitters[emitter.cid] = {
      emitter: emitter,
      options: ops,
      count: 0,
      lastr: 0,
      active: (ops.auto ? true : false)
    };

    return e;
  },

  toggleEmiter: function(eid, active){
    var e = this.emitters[eid];
    if (e) {
      e.active = active;
    }
  },

  playEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, true);
  },

  stopEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, false);
  },

  createEmitterParticles: function(cid, howMany){
    for (var i=0; i<howMany; i++){
      var e = this.emitters[cid];
      if (!this.initParticle(e.emitter, e.options)){
        return;
      }
    }
  },

  runEmitters: function(){
    for (var cid in this.emitters){
      var e = this.emitters[cid];
      e.lastr -= $.dt;

      if (e.active && e.count < e.options.max && e.lastr <= 0){
        e.lastr = e.options.rate;
        var am = e.options.ratep;
        this.createEmitterParticles(cid, am);
        e.count += am;
      }
    }
  },

  initParticle: function(emitter, opts){
    var p = this.getParticle();
    
    if (p){

      p.active = true;

      p.g = opts.g || $.V.zero;
      p.d = opts.d || $.V.one;
      p.f = opts.f || $.V.one;

      p.pos = emitter.pos;

      if (opts.rad) {

        var rX = $.M.rnd(0, opts.rad) * $.M.rnd11();
        var rY = $.M.rnd(0, opts.rad) * $.M.rnd11();
        
        p.pos = { x: emitter.pos.x+rX, y: emitter.pos.y+rY };
      }

      p.cFrom = opts.cFrom;
      p.cTo = opts.cTo;

      p.life = opts.life;
      p.tlife = opts.life;
      p.size = opts.size || 1;

      p.emitter = emitter;
      
      return true;
    }

    return false;
  },

  getParticle: function(){
    var ps = this.entities
      , len = ps.length;

    for(var i = 0; i< len; i++){
      if (!ps[i].active){
        return ps[i];
      }
    }

    return null;
  },

  updateParticle: function(p){
    p.f = $.V.multiply(p.g, $.dt);
    p.d = $.V.add(p.d, p.f);
    p.pos = $.V.add(p.pos, $.V.multiply(p.d, $.dt));

    if (p.cFrom && p.cTo) {
      p.color = $.C.lerp(p.cFrom, p.cTo, 1 - ((p.life*100) / p.tlife)/100);
    }

    p.life -= $.dt;
  },

  drawParticle: function(ctx, p){

    $.Renderer.circle(ctx, {
      pos: p.pos,
      radius: p.size,
      fill: p.color
    });

  },

  update: function(){
    this.runEmitters();

    this.entities.forEach(function(p){
      if (p.life <= 0){
        p.active = false;
      }

      if (p.active){
        this.updateParticle(p);
      }
      else if (p.emitter) {
        var e = this.emitters[p.emitter.cid];
        if (e && e.active) {
          e.count--;
        }
      }
    }, this);
  },

  draw: function(ctx){
    this.entities.forEach(function(p){
      if (p.active){
        this.drawParticle(ctx, p);
      }
    }, this);
  }


});
