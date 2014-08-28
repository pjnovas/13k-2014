
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
    for(var i=0;i<4;i++){
      this.move.push({ x: i*32, y: 0, w: 32, h: 32 });
    }

    this.sprite = this.move[0];
  },

  setNode: function(nFrom, nTo){
    this.nFrom = nFrom;
    this.nTo = nTo;

    this.t_startMove = Time.time;
    this.journeyLength = $.V.magnitude(nFrom.pos, nTo.pos);
    this.traveling = true;

    this.angle = $.V.angleTo(this.pos, this.nTo.pos);
  },

  setDead: function(){
    if (!this.isDead){
      this.isDead = true;
      this.onDead();
    }
  },

  animate: function(){

    if (!this.staying){
      this.lastFrameTime -= Time.frameTime;

      if (this.lastFrameTime <= 0){
        this.spriteIndex++;
        if (this.spriteIndex > 3){
          this.spriteIndex = 0;
        }

        this.lastFrameTime = this.animTime / this.speed;
      }
    }

  },

  updateTemp: function(){
    var nfromT = this.nFrom.temp;
    var ntoT = this.nTo.temp;

    if (nfromT === 0 && ntoT === 0){
      this.temp = 0;
      return;
    }

    if (nfromT > ntoT){
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
    var tm = Time.time
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

    var distCovered = (Time.time - this.t_startMove) * this.speed;
    var fracJourney = distCovered / this.journeyLength;
    
    if (fracJourney > 1) {
      this.pos = this.nTo.pos;
      this.nTo.revive();

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
    
    this.updateTemp();

    if (this.building || this.traveling){
      var ended = this.updateMove();
      if (!ended){
        return;
      }
    }

    this.updateState();
  },

  draw: function(ctx){
    if (this.isDead){
      return;
    }

    if (this.building){
      $.Renderer.drawLine(ctx, {
        from: this.pos,
        to: this.nFrom.pos,
        size: 2,
        color: $.C.toRGBA($.C.white)
      });
    }

    $.Spider._super.draw.apply(this, arguments);
  }

});
