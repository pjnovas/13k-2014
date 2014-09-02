
$.Spider = $.Sprite.extend({

  resource: "spider",
  size: { x: 32, y: 32 },

  nFrom: null,
  nTo: null,
  journeyLength: null,

  traveling: false,
  isDead: false,

  temp: 0,
  staying: false,

  t_stay: 2000,
  t_startStay: 0,
  t_nextStay: 0,

  t_startMove: 0,

  building: false,

  spriteIndex: 0,

  animTime: 3,
  lastFrameTime: 0,
  exited: false,

  calmSpeed: 0.05,
  alertSpeed: 0.1,

  behaviour: {
      alertTemp: 0
    , tStayA: 3000
    , tStayB: 10000
  },

  start: function(options){
    this.pos = $.V.round(options.pos);
    this.onDead = options.onDead;

    this.speed = this.calmSpeed;

    this.move = [];
    for(var i=0;i<3;i++){
      this.move.push({ x: i*32, y: 0, w: 32, h: 32 });
    }

    this.sprite = this.move[0];
  },

  setNode: function(nFrom, nTo){
    this.nFrom = nFrom;
    this.nTo = nTo;

    this.t_startMove = $.tm;
    this.journeyLength = $.V.magnitude(nFrom.pos, nTo.pos);
    this.traveling = true;

    this.angle = $.V.angleTo(this.pos, this.nTo.pos);
  },

  setDead: function(){
    if (!this.isDead){
      this.nFrom = null;
      this.nTo = null;
      this.dying = true;
      this.vel = 1;
      this.pos = {
        x: this.pos.x,
        y: this.pos.y
      };
      this.onDead();
    }
  },

  burn: function(){
    this.building = false;
    this.burning = $.tm + 3000;
    this.temp = 1;

    Particles.createEmitter(this, {
      auto: true,
      max: 50,
      rate: 0.1,
      ratep: 2,
      life: 1,
      rad: 10,
      size: 10,
      cFrom: [100,,,0.4],
      cTo: [10,10,10,0.1],
      g: { x: 0, y: -100}
    });
  },

  animate: function(){

    if (!this.staying){
      this.lastFrameTime -= $.ft;

      if (this.lastFrameTime <= 0){
        this.spriteIndex++;
        if (this.spriteIndex > 2){
          this.spriteIndex = 0;
        }

        this.lastFrameTime = this.animTime / this.speed;
      }
    }

  },

  updateTemp: function(){
    var nfrom = this.nFrom
      , nto = this.nTo
      , nfromT = nfrom.temp
      , ntoT = nto.temp;

    if (this.temp === 1){
      return;
    }

    if (nfrom.blowing || nto.blowing){
      this.temp = 0.1;
      return;
    }

    if (!nfromT && !ntoT){  
      this.temp = 0;
      return;
    }

    if (nfromT >= ntoT){
      this.temp = nfromT;
      return;
    }

    if (ntoT > nfromT){
      this.temp = ntoT;
    }
  },

  canMove: function(){
    return !this.staying && !this.traveling && !this.building;
  },

  updateState: function(){
    var tm = $.tm
      , cfgTm = this.behaviour
      , tstart = this.t_startStay
      , tstay = this.t_stay;

    if (this.temp > cfgTm.alertTemp){ //alert behaviour!
      this.speed = this.alertSpeed;
      this.staying = false;
      return;
    }

    // calm behaviour
    this.speed = this.calmSpeed;

    if (this.staying){
      if(tm > tstart + tstay) {
        this.staying = false;
        this.t_nextStay = tm + tstay / $.M.rnd(2, 5);
      }
    }
    else if (tm > this.t_nextStay && $.M.rnd01() < 0.8){
      this.staying = true;
      this.t_startStay = tm;
      this.t_stay = $.M.rnd(cfgTm.tStayA, cfgTm.tStayB);
    }

  },

  // returns true if the travel is ended
  updateMove: function(){

    if (!this.building && (this.nFrom.burned || this.nTo.burned)){
      this.setDead();
      return;
    }

    var distCovered = ($.tm - this.t_startMove) * this.speed;
    var fracJourney = distCovered / this.journeyLength;
    
    if (fracJourney > 1) {
      this.pos = $.V.clone(this.nTo.pos);
      this.nTo.revive();
      
      if (this.burning){
        this.nTo.burn();
      }
      
      this.traveling = false;
      this.building = false;

      return true;
    }

    this.pos = $.V.round($.V.lerp(this.nFrom.pos, this.nTo.pos, fracJourney));

    this.animate();
  },

  buildWeb: function(from, to){
    this.building = true;
    this.traveling = true;
    this.setNode(from, to);
  },

  update: function(){
    this.sprite = this.move[this.spriteIndex];

    if (this.isDead || this.exited || this.inVacuum){
      return;
    }

    if (this.dying){
      this.vel++;
      this.pos.y += this.vel;

      if (this.pos.y > config.size.y){
        this.isDead = true;
        Particles.stopEmiter(this);
      }
      return;
    }
    
    this.updateTemp();

    if (this.building || this.traveling){
      if (!this.updateMove()){
        return;
      }
    }

    this.updateState();

    if (this.burning && this.burning < $.tm){
      this.setDead();
    }
  },

  draw: function(ctx){
    if (this.isDead){
      return;
    }

    if (this.building){
      $.Renderer.line(ctx, {
        pos: this.pos,
        to: this.nFrom.pos,
        size: 2,
        color: $.C.white
      });
    }

    $.Spider._super.draw.apply(this, arguments);
  }

});
