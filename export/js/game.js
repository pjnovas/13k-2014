(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Manager = require("./Manager");

var Game = module.exports = function(opts){
  this.cview = opts.viewport;
  this.cworld = opts.world;

  this.viewCtx = null;
  this.worldCtx = null;

  this.tLoop = null;
  this.paused = false;
  this.boundGameRun = this.gameRun.bind(this);

  this.manager = new Manager();

  this.initialize();
};

Game.prototype.initialize = function(){
  var size = config.size;

  if (this.cview.getContext){
    this.cview.width = size.x;
    this.cview.height = size.y;
    this.viewCtx = this.cview.getContext("2d");
  }
  else { throw "canvas not supported!"; }

  this.worldCtx = this.cworld.getContext("2d");
  this.cworld.width = size.x;
  this.cworld.height = size.y;
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

var Nodes = require("./Nodes");
var Paths = require("./Paths");

var Manager = module.exports = function(){
  
  this.nodes = new Nodes({
    rows: 10,
    cols: 15,
    nodeSize: 7
  });

  this.paths = new Paths({
    nodes: this.nodes
  });
};

Manager.prototype.update = function(){
  //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
};

Manager.prototype.draw = function(viewCtx, worldCtx){
  var s = config.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);

  this.nodes.draw(worldCtx);
};
},{"./Nodes":6,"./Paths":7}],4:[function(require,module,exports){

var Mathf = {};

Mathf.random = function(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};

Mathf.random11 = function(){
  return Math.round(Math.random());
};

Mathf.random01 = function(){
  return Math.random();
};

Mathf.randomAngle = function(){
  return Math.random() * Math.PI * 2;
};

Mathf.randomInCircle = function(radius){
  var angle = Mathf.randomAngle();
  var rad = Mathf.random(0, radius);

  return {
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad
  };
};

module.exports = Mathf;

},{}],5:[function(require,module,exports){

var Node = module.exports = function(opts){
  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";

  this.nearNodes = [];
};

Node.prototype.addNearNode = function(node){
  this.nearNodes.push(node);
};

Node.prototype.update = function(){
  
};

Node.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};
},{}],6:[function(require,module,exports){

var Node = require("./Node");

var Nodes = module.exports = function(opts){

  this.rows = opts.rows;
  this.cols = opts.cols;
  this.nodeSize = opts.nodeSize;

  this.nodeGrid = [];
//  this.gridCellsDebug = [];

  this.createGrid();

  this.paths = [];
  this.createPaths();
};

Nodes.prototype.createGrid = function(){
  var size = this.nodeSize
    , gsize = config.size

    , cw = gsize.x/this.cols
    , ch = gsize.y/this.rows
    , rndR = ch/2;

  for (var i=0; i<this.rows; i++){
    this.nodeGrid[i] = [];

    for (var j=0; j<this.cols; j++){

      if ( (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0) ){
/*
        //debug cell
        this.gridCellsDebug.push({
          pos: { x: cw*j, y: ch*i },
          size: { x: cw, y: ch },
          color: "silver"
        });
*/
        continue;
      }
/*
      //debug cell
      this.gridCellsDebug.push({
        pos: { x: cw*j, y: ch*i },
        size: { x: cw, y: ch },
        color: "red"
      });
*/
      var point = Mathf.randomInCircle(rndR);
      var center = Vector.center({ x: cw*j, y: ch*i }, { x: cw, y: ch });

      this.nodeGrid[i][j] = new Node({
        pos: Vector.add(center, point),
        size: size
      });
    }
  }

};

Nodes.prototype.createPaths = function(){

  this.nodeGrid.forEach(function (row, i) {
    row.forEach(function (node, j) {
      if (node) {
        this.findNearNodes(i, j, node);
      }
    }, this);
  }, this);

};

Nodes.prototype.findNearNodes = function(i, j, node){
  var paths = this.paths
    , rows = this.rows
    , cols = this.cols;

  function hasPath(a, b){
    return paths.some(function(path){
      var pa = path.a, pb = path.b;

      return (
        (Vector.eql(a, pa) || Vector.eql(a, pb)) &&
        (Vector.eql(b, pa) || Vector.eql(b, pb))
      );
    });
  }

  function addPath(nA, nB){
    if (nB && !hasPath(nA.pos, nB.pos)){
      paths.push({
        a: Vector.clone(nA.pos),
        b: Vector.clone(nB.pos)
      });
    }
  }

  [ [-1,-1], [1,1], [-1,1], [1,-1] ].forEach(function (box) {
    var x = i + box[0]
      , y = j + box[1];
    
    if (x >= 0 && x <= rows-1 && y >= 0 && y <= cols-1){
      addPath(node, this.nodeGrid[x][y]);
    }
  }, this);

};

Nodes.prototype.update = function(){
  
};

Nodes.prototype.draw = function(ctx){
/*
  // for debug
  for (var k=0; k<this.gridCellsDebug.length; k++){
    var c = this.gridCellsDebug[k];
    Renderer.drawRect(ctx, c);

    if (c.color === "red"){
      Renderer.drawCircle(ctx, {
        pos: Vector.center(c.pos, c.size),
        radius: c.size.y/2,
        color: "yellow"
      });
    }

    Renderer.drawCircle(ctx, {
      pos: Vector.center(c.pos, c.size),
      radius: 3,
      color: "black"
    });
  }
*/

  this.nodeGrid.forEach(function (row) {
    row.forEach(function (node) {
      if (node) {
        node.draw(ctx);
      }
    });
  });

  this.paths.forEach(function (path) {
    Renderer.drawLine(ctx, {
      from: path.a,
      to: path.b,
      size: 2,
      color: "#fff"
    });
  });

};
},{"./Node":5}],7:[function(require,module,exports){

//var Path = require("./Path");

var Paths = module.exports = function(opts){
  this.nodes = opts.nodes;
  this.paths = [];
  this.createPaths();
};

Paths.prototype.createPaths = function(){
  /*
  var ps = this.nodes;
  var pl = ps.length;

  for (var i=0; i<pl; i++){
    this.paths.push(new Path({
      from: p,
      to: p,
      size: 7
    }));
  }
  */
};

Paths.prototype.update = function(){
  
};

Paths.prototype.draw = function(ctx){
  var ps = this.paths;
  var pl = ps.length;

  for (var i=0; i<pl; i++){
    ps[i].draw(ctx);
  }

};
},{}],8:[function(require,module,exports){

var Renderer = {};

Renderer.drawCircle = function(ctx, ps){
  ctx.beginPath();
  ctx.arc(ps.pos.x, ps.pos.y, ps.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = ps.color;
  ctx.fill();
};

Renderer.drawLine = function(ctx, ps){
  var a = ps.from
    , b = ps.to;

  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);

  ctx.lineWidth = ps.size;
  ctx.strokeStyle = ps.color;
  ctx.stroke();
};

Renderer.drawRect = function(ctx, ps){
  ctx.beginPath();
  
  ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
  ctx.fillStyle = ps.color || "yellow";
  ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'black';
  ctx.stroke();
};

module.exports = Renderer;

},{}],9:[function(require,module,exports){

module.exports = {

  

};

},{}],10:[function(require,module,exports){

var Vector = {};

Vector.zero = { x: 0, y: 0 };
Vector.one = { x: 1, y: 1 };

Vector.create = function(x, y){
  return { x: x, y: y};
};

Vector.clone = function(vec){
  return { x: vec.x, y: vec.y };
};
/*
Vector.multiply = function(vector, delta){
  return { x: vector.x * delta, y: vector.y * delta };
};

Vector.divide = function(vector, delta){
  return { x: vector.x / delta, y: vector.y / delta };
};
*/
Vector.add = function(a, b){
  return { x: a.x + b.x, y: a.y + b.y };
};

Vector.eql = function(a, b){
  return (a.x === b.x && a.y === b.y);
};

Vector.center = function(pos, size){
  return {
      x: pos.x + size.x/2,
      y: pos.y + size.y/2,
  };
};
/*
Vector.debug = function(vec){
  console.log(vec.x + " : " + vec.y);
};
*/
module.exports = Vector;

},{}],11:[function(require,module,exports){

require("./reqAnimFrame");
var GameTime = require("./GameTime");

window.Mathf = require("./Mathf");
window.Vector = require("./Vector");
window.Renderer = require("./Renderer");

window.onload = function() {
  
  window.Time = new GameTime();

  var Game = require("./Game");

  window.config = require("./Settings");

  window.config.size = {
    x: 1000,
    y: 600
  };

  window.game = new Game({
    viewport: document.getElementById("game-viewport"),
    world: document.getElementById("game-world")
  });

  window.game.start();
};
},{"./Game":1,"./GameTime":2,"./Mathf":4,"./Renderer":8,"./Settings":9,"./Vector":10,"./reqAnimFrame":12}],12:[function(require,module,exports){
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
},{}]},{},[11]);
