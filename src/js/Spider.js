
var Spider = module.exports = function(pos){
  var cfg = config.spiders;

  this.pos = Vector.round(pos);

  this.size = cfg.size;
  this.color = cfg.color;
  this.speed = cfg.speed;

  this.nFrom = null;
  this.nTo = null;
  this.journeyLength = null;

  this.traveling = false;
  this.collider = this.size * 3;
  this.isDead = false;

  this.temp = 0;
  this.staying = false;

  this.t_stay = 2000;
  this.t_startStay = 0;
  this.t_nextStay = 0;

  this.t_startMove = 0;

  this.building = false;
};

Spider.prototype.setNode = function(nFrom, nTo){
  this.nFrom = nFrom;
  this.nTo = nTo;

  this.t_startMove = Time.time;
  this.journeyLength = Vector.length(nFrom.pos, nTo.pos);
  this.traveling = true;
};
/*
Spider.prototype.switchTravel = function(){
  var aux = this.nFrom;
  this.nFrom = this.nTo;
  this.nTo = aux;

  this.t_startMove = Time.time;
};
*/
Spider.prototype.setDead = function(){
  this.isDead = true;
};

Spider.prototype.updateTemp = function(){
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
    //this.switchTravel();
  }
};

Spider.prototype.updateState = function(){
  var cfg = config.spiders
    , tm = Time.time
    , cfgTm = cfg.behaviour
    , tstart = this.t_startStay
    , tstay = this.t_stay;

  if (this.temp > cfgTm.alertTemp){ //alert behaviour!

    this.speed = cfg.speedAlert;

    if (this.staying){
      this.t_startMove += tm - tstart;
    }

    this.staying = false;
    return;
  }

  // calm behaviour
  this.speed = cfg.speed;

  if (this.staying){
    if(tm > tstart + tstay) {
      this.staying = false;
      this.t_startMove += tstay;
      this.t_nextStay = tm + tstay / Mathf.rnd(2, 5);
    }
  }
  else if (tm > this.t_nextStay && Mathf.rnd(0, 1000) > 900){
    this.staying = true;
    this.t_startStay = tm;
    this.t_stay = Mathf.rnd(cfgTm.tStayA, cfgTm.tStayB);
  }

};

Spider.prototype.updateMove = function(){

  if (!this.building && (this.nFrom.burned || this.nTo.burned)){
    this.setDead();
    return;
  }

  if (this.staying) {
    return;
  }

  var distCovered = (Time.time - this.t_startMove) * this.speed;
  var fracJourney = distCovered / this.journeyLength;
  
  if (fracJourney > 1) {
    this.pos = this.nTo.pos;
    this.traveling = false;
    this.nTo.revivie();
    this.building = false;
    return;
  }

  this.pos = Vector.round(Vector.lerp(this.nFrom.pos, this.nTo.pos, fracJourney));
};

Spider.prototype.buildWeb = function(from, to){
  this.building = true;
  this.traveling = true;
  this.setNode(from, to);
};

Spider.prototype.update = function(){
  if (this.isDead){
    return;
  }

  if (!this.journeyLength){
    return;
  }

  if (!this.building){
    this.updateTemp();
    this.updateState();
  }

  this.updateMove();
};

Spider.prototype.draw = function(ctx){
  if (this.isDead){
    return;
  }

/*
  //debug collider
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.collider,
    color: "rgba(0,255,0,0.2)"
  });
*/

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color)
  });

  if (this.building){
    Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.nFrom.pos,
      size: config.paths.size,
      color: Color.toRGBA(config.nodes.colors.cold)
    });
  }
};
