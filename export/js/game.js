(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Manager = require("./Manager");

var Game = module.exports = function(opts){
  this.cview = opts.viewport;
  this.cworld = opts.world;

  this.gameSize = opts.size;

  this.viewCtx = null;
  this.worldCtx = null;

  this.tLoop = null;
  this.paused = false;
  this.boundGameRun = this.gameRun.bind(this);

  this.manager = new Manager({
    size: opts.size
  });

  this.initialize();
};

Game.prototype.initialize = function(){
  if (this.cview.getContext){
    this.cview.width = this.gameSize.width;
    this.cview.height = this.gameSize.height;
    this.viewCtx = this.cview.getContext("2d");
  }
  else { throw "canvas not supported!"; }

  this.worldCtx = this.cworld.getContext("2d");
  this.cworld.width = this.gameSize.width;
  this.cworld.height = this.gameSize.height;
};

Game.prototype.loop = function(){
  //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
  this.manager.update();
  this.manager.draw(this.viewCtx, this.worldCtx);
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
  if (Time.tick()) { this.loop(); }
  this.tLoop = window.requestAnimationFrame(this.boundGameRun);
};

},{"./Manager":3}],2:[function(require,module,exports){
// Manages the ticks for a Game Loop

var GameTime = module.exports = function(){
  this.lastTime = Date.now();
  this.frameTime = 0;
  this.deltaTime = 0;
  this.typicalFrameTime = 20;
  this.minFrameTime = 12; 
  this.time = 0;
};

// move the clock one tick. 
// return true if new frame, false otherwise.
GameTime.prototype.tick = function() {
  var now = Date.now();
  var delta = now - this.lastTime;

  if (delta < this.minFrameTime ) {
    return false;
  }

  if (delta > 2 * this.typicalFrameTime) { // +1 frame if too much time elapsed
    this.frameTime = this.typicalFrameTime;
  } else {  
    this.frameTime = delta;      
  }

  this.deltaTime = this.frameTime/1000;
  this.time += this.frameTime;
  this.lastTime = now;

  return true;
};

GameTime.prototype.reset = function() {
  this.lastTime = Date.now();
  this.frameTime = 0;
  this.deltaTime = 0;
  this.typicalFrameTime = 20;
  this.minFrameTime = 12; 
  this.time = 0;
};
},{}],3:[function(require,module,exports){

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
},{}],4:[function(require,module,exports){

require("./reqAnimFrame");
var GameTime = require("./GameTime");

window.onload = function() {
  
  window.Time = new GameTime();

  var Game = require("./Game");
  window.game = new Game({
    viewport: document.getElementById("game-viewport"),
    world: document.getElementById("game-world"),
    size: {
      width: 800,
      height: 600
    }
  });

  window.game.start();
};
},{"./Game":1,"./GameTime":2,"./reqAnimFrame":5}],5:[function(require,module,exports){
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function(callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function(id) { window.clearTimeout(id); };
  }
}());
},{}]},{},[4]);
