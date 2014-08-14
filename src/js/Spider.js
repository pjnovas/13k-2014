
var Spider = module.exports = function(opts){

  this.pos = Vector.round(opts.pos);
  this.size = 5;
  this.color = [115,255,0];

  this.nodeFrom = null;
  this.nodeTo = null;
  this.journeyLength = null;

  this.speed = 0.05;

  this.traveling = false;
  this.collider = this.size * 3;
  this.isDead = false;

  this.temp = 0;
  this.scared = false;
  this.staying = false;

  this.t_stay = 2000;
  this.t_startStay = 0;
  this.t_nextStay = 0;

  this.t_startMove = 0;
};

Spider.prototype.setNode = function(nodeFrom, nodeTo){
  this.nodeFrom = nodeFrom;
  this.nodeTo = nodeTo;

  this.t_startMove = Time.time;
  this.journeyLength = Vector.length(nodeFrom.pos, nodeTo.pos);
  this.traveling = true;

  this.nextStayTime = this.stayTime * 5;
};
/*
Spider.prototype.switchTravel = function(){
  var aux = this.nodeFrom;
  this.nodeFrom = this.nodeTo;
  this.nodeTo = aux;

  this.t_startMove = Time.time;
};
*/
Spider.prototype.setDead = function(){
  this.isDead = true;
};

Spider.prototype.updateTemp = function(){
  var nfromT = this.nodeFrom.temp;
  var ntoT = this.nodeTo.temp;

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

  this.scared = true;
  if (this.temp === 0){
    this.scared = false;
  }

  if (this.scared){
    this.speed = 0.1;
    if (this.staying){
      this.t_startMove += Time.time - this.t_startStay;
    }

    this.staying = false;
    return;
  }

  this.speed = 0.05;
  if (this.staying){
    if(Time.time > this.t_startStay + this.t_stay) {
      this.staying = false;
      this.t_startMove += this.t_stay;
      this.t_nextStay = Time.time + this.t_stay / Mathf.rnd(2, 5);
    }
  }
  else {

    if (Time.time > this.t_nextStay && Mathf.rnd(0, 1000) > 900){
      this.staying = true;
      this.t_startStay = Time.time;
      this.t_stay = Mathf.rnd(3000, 10000);
    }
  }

};

Spider.prototype.updateMove = function(){

  if (this.nodeFrom.burned || this.nodeTo.burned){
    this.setDead();
    return;
  }

  if (this.staying) {
    return;
  }

  var distCovered = (Time.time - this.t_startMove) * this.speed;
  var fracJourney = distCovered / this.journeyLength;
  
  if (fracJourney > 1) {
    this.pos = this.nodeTo.pos;
    this.traveling = false;
    return;
  }

  this.pos = Vector.round(Vector.lerp(this.nodeFrom.pos, this.nodeTo.pos, fracJourney));
};

Spider.prototype.update = function(){
  if (this.isDead){
    return;
  }

  if (!this.journeyLength){
    return;
  }

  this.updateTemp();
  this.updateState();
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
};
