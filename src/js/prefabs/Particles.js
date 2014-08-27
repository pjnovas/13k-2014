/*
//var Fire = require("./Fire");
//var WebBurned = require("./WebBurned");

var Particles = module.exports = function(){
  this.particles = [];
  this.emitters = {};

  this.init(1000); //max particles in world
};

Particles.prototype.init = function(max){
  for (var i=0; i<max; i++){
    this.particles.push({
      active: false
    });
  }  
};

Particles.prototype.createEmitter = function(emitter, ops){
  if (!emitter.eid){
    emitter.eid = _.guid("emitters");
  }

  this.emitters[emitter.eid] = {
    emitter: emitter,
    options: ops,
    count: 0,
    active: true
  };
};

Particles.prototype.removeEmitter = function(emitterId){
  this.emitters[emitterId].active = false;

  this.particles.forEach(function(p){
    if (p.emitter.id === emitterId){
      p.active = false;
    }
  });

  this.emitters[emitterId] = null;
};

Particles.prototype.createEmitterParticles = function(eid, howMany){
  for (var i=0; i<howMany; i++){
    var e = this.emitters[eid];
    if (!this.initParticle(e.emitter, e.options)){
      return;
    }
  }
};

Particles.prototype.runEmitters = function(){
  for (var eid in this.emitters){
    var e = this.emitters[eid];

    // TODO: add creation rate
    if (e.active && e.count < e.options.max){
      this.createEmitterParticles(eid, e.options.max - e.count);
    }
  }
};

Particles.prototype.initParticle = function(emitter, opts){
  var p = this.getParticle();
  
  if (p){

    p.active = true;
    
    p.type = opts.type;

    //p.pos = opts.pos;
    p.g = opts.g || Vector.zero;
    p.d = opts.d || Vector.zero;
    p.f = opts.f || Vector.zero;
    
    p.colorFrom = opts.colorFrom;
    p.colorTo = opts.colorTo;

    p.life = opts.life;
    p.tlife = opts.life;
    p.size = opts.size;

    p.emitter = emitter;
    
    return true;
  }

  return false;
};

Particles.prototype.getParticle = function(){
  var ps = this.particles
    , len = ps.length;

  for(var i = 0; i< len; i++){
    if (!ps[i].active){
      return ps[i];
    }
  }

  return null;
};

Particles.prototype.updateParticle = function(p){
  var dt = Time.deltaTime;

  p.f = Vector.multiply(p.g, dt);
  p.d = Vector.add(p.d, p.f);
  p.pos = Vector.multiply(p.d, dt);
  
  // update current pos with a parent emitter
  p.pos = Vector.add(p.emitter.pos, p.pos);

  //p.anglerot += p.rotation;

  if (!p.size) {
    p.size = 1;
  }

  //p.size += p.deltaScale * dt;

  if (p.life && p.colorFrom && p.colorTo) {
    p.color = Color.lerp(p.colorFrom, p.colorTo, ((p.life*100) / p.tlife)/100);
  }

  p.life -= dt;
};

Particles.prototype.drawParticle = function(ctx, p){

  switch(p.type){
    case "circle":
      Renderer.drawCircle(ctx, {
        pos: p.pos,
        radius: p.size,
        color: Color.toRGBA(p.color)
      });
    break;
  }
};

Particles.prototype.update = function(){
  this.runEmitters();

  this.particles.forEach(function(p){
    if (p.life <= 0){
      p.active = false;
    }

    if (p.active){
      this.updateParticle(p);
    }
    else if (p.emitter) {
      var e = this.emitters[p.emitter.id];
      if (e && e.active) {
        e.count--;
      }
    }
  }, this);
};

Particles.prototype.draw = function(ctx){
  this.particles.forEach(function(p){
    if (p.active){
      this.drawParticle(ctx, p);
    }
  }, this);
};

*/