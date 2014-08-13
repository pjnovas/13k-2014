
var GameTime = require("./GameTime");
window.gameTime = new GameTime();

var Game = module.exports = function(){
  this.tLoop = null;
  this.paused = false;
  this.boundGameRun = this.gameRun.bind(this);
};

Game.prototype.loop = function(){
  //console.log(window.gameTime.frameTime + "( " + window.gameTime.deltaTime + " ) / " + window.gameTime.time);
};

Game.prototype.start = function(){
  this.paused = false;
  this.gameRun();
};

Game.prototype.stop = function(){
  this.paused = true;
  window.cancelAnimationFrame(this.tLoop);
};

Game.prototype.gameRun = function(){
  if (window.gameTime.tick()) { this.loop(); }
  this.tLoop = window.requestAnimationFrame(this.boundGameRun);
};
