
var Manager = module.exports = function(opts){
  this.size = opts.size;
};

Manager.prototype.update = function(){
  //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
};

Manager.prototype.draw = function(viewCtx, worldCtx){
  viewCtx.clearRect(0, 0, this.size.width, this.size.height);
  worldCtx.clearRect(0, 0, this.size.width, this.size.height);

  viewCtx.beginPath();
  viewCtx.arc(100, 100, 50, 0, 2 * Math.PI, false);
  viewCtx.fillStyle = 'red';
  viewCtx.fill();

  worldCtx.beginPath();
  worldCtx.arc(150, 150, 25, 0, 2 * Math.PI, false);
  worldCtx.fillStyle = 'blue';
  worldCtx.fill();
};