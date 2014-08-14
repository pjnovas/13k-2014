(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Mouse = module.exports = function(options){
  this.container = options.container || window.document;

  this.events = {
      "pressed": null
  };

  this.enabled = false;

  this.onMouseUp = this._onMouseUp.bind(this);
  this.container.onmouseup = this.onMouseUp;
};

Mouse.prototype.enable = function(){
  this.enabled = true;
  return this;
};

Mouse.prototype.disable = function(){
  this.enabled = false;
  return this;
};

Mouse.prototype.on = function(evName, callback){
  if (!this.events[evName]){
    this.events[evName] = [];
  }

  this.events[evName].push(callback);

  return this;
};

Mouse.prototype.off = function(evName){
  if (this.events[evName]){
    this.events[evName].length = 0;
  }

  return this;
};

function getCoordsEvent(e, canvas){
  var x, y;

  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  }
  else { 
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
  } 
  
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  
  return { x: x, y: y };
}

Mouse.prototype._onMouseUp = function(e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events.pressed.forEach(function(cb){
    cb(pos);
  });
};
},{}],2:[function(require,module,exports){

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
  Controls.enable();
};

Game.prototype.stop = function(){
  this.paused = true;
  window.cancelAnimationFrame(this.tLoop);
};

Game.prototype.gameRun = function(){
  if (Time.tick()) { this.loop(); }
  this.tLoop = window.requestAnimationFrame(this.boundGameRun);
};

},{"./Manager":4}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){

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
  this.nodes.update();
};

Manager.prototype.draw = function(viewCtx, worldCtx){
  var s = config.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);

  this.nodes.draw(worldCtx);
};
},{"./Nodes":7,"./Paths":9}],5:[function(require,module,exports){

var Mathf = {};

Mathf.rnd = function(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};
/*
Mathf.rnd11 = function(){
  return Math.round(Math.random());
};

Mathf.rnd01 = function(){
  return Math.random();
};
*/
Mathf.rndAngle = function(){
  return Math.random() * Math.PI * 2;
};

Mathf.rndInCircle = function(radius){
  var angle = Mathf.rndAngle();
  var rad = Mathf.rnd(0, radius);

  return {
    x: Math.cos(angle) * rad,
    y: Math.sin(angle) * rad
  };
};

module.exports = Mathf;

},{}],6:[function(require,module,exports){

var Node = module.exports = function(opts){
  this.id = Utils.guid("nodes");

  this.row = opts.row;
  this.col = opts.col;

  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";

  this.nears = [];
  this.selected = false;
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
};

Node.prototype.select = function(){
  var selected = !this.selected;
  this.selected = selected;

  this.nears.forEach(function (node){
    node.selected = selected;
  });
};

Node.prototype.update = function(){
  this.color = "#fff";

  if (this.selected){
    this.color = "red";
  }
};

Node.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};
},{}],7:[function(require,module,exports){

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(opts){

  this.rows = opts.rows;
  this.cols = opts.cols;
  this.nodeSize = opts.nodeSize;

  this.nodes = [];
  this.nodeGrid = [];

//  this.gridCellsDebug = [];

  this.createGrid();

  this.paths = new Paths();
  this.createPaths();

  Controls.on("pressed", this.findNodeByCollider.bind(this));
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
      var point = Mathf.rndInCircle(rndR);
      var center = Vector.center({ x: cw*j, y: ch*i }, { x: cw, y: ch });

      var node = new Node({
        pos: Vector.add(center, point),
        size: size,
        row: i,
        col: j
      });

      this.nodeGrid[i][j] = node;
      this.nodes.push(node);
    }
  }

};

Nodes.prototype.createPaths = function(){

  this.nodes.forEach(function (node) {
    this.findNearNodes(node.row, node.col, node);
  }, this);

};

Nodes.prototype.findNearNodes = function(i, j, node){
  var rows = this.rows
    , cols = this.cols;

  [ [-1,-1], [1,1], [-1,1], [1,-1] ].forEach(function (box) {
    var x = i + box[0]
      , y = j + box[1];
    
    if (x >= 0 && x <= rows-1 && y >= 0 && y <= cols-1){
      this.paths.addOne(node, this.nodeGrid[x][y]);
    }
  }, this);

};

Nodes.prototype.findNodeByCollider = function(pos){
  
  this.nodes.forEach(function (node) {
    if (Vector.pointInCircle(pos, node.pos, node.size)) {
      node.select();
    }
  });

};

Nodes.prototype.update = function(){
  this.paths.update();

  this.nodes.forEach(function (node) {
    node.update();
  });
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

  this.paths.draw(ctx);

  this.nodes.forEach(function (node) {
    node.draw(ctx);
  });

};
},{"./Node":6,"./Paths":9}],8:[function(require,module,exports){

var Path = module.exports = function(opts){
  this.na = opts.na;
  this.nb = opts.nb;

  this.size = 2;
  this.color = "#fff";
};

Path.prototype.update = function(){
  
};

Path.prototype.draw = function(ctx){

  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

};
},{}],9:[function(require,module,exports){

var Path = require("./Path");

var Paths = module.exports = function(){
  this.paths = [];
};

Paths.prototype.hasOne = function(naId, nbId){

  return this.paths.some(function(path){
    var pa = path.na.id, pb = path.nb.id;
    return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
  });
};

Paths.prototype.addOne = function(nA, nB){

  if (nB && !this.hasOne(nA.id, nB.id)){
    nA.addNear(nB);
    nB.addNear(nA);

    this.paths.push(new Path({
      na: nA,
      nb: nB
    }));
  }
};

Paths.prototype.update = function(){
  this.paths.forEach(function (path) {
    path.update();
  });
};

Paths.prototype.draw = function(ctx){
  this.paths.forEach(function (path) {
    path.draw(ctx);
  });
};
},{"./Path":8}],10:[function(require,module,exports){

var Physics = {};

Physics.test = function(x, y){
  return { x: x, y: y};
};

module.exports = Physics;

},{}],11:[function(require,module,exports){

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

},{}],12:[function(require,module,exports){

module.exports = {

  

};

},{}],13:[function(require,module,exports){

var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};
},{}],14:[function(require,module,exports){

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

Vector.dif = function(from, to){
  return { x: to.x - from.x, y: to.y - from.y };
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

Vector.pointInCircle = function(p, pos, radius){
  var dif = Vector.dif(p, pos);
  var len = Math.sqrt(dif.x*dif.x + dif.y*dif.y);
  return len < radius;
};

/*
Vector.debug = function(vec){
  console.log(vec.x + " : " + vec.y);
};
*/
module.exports = Vector;

},{}],15:[function(require,module,exports){

require("./reqAnimFrame");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");

window.Mathf = require("./Mathf");
window.Vector = require("./Vector");
window.Physics = require("./Physics");
window.Renderer = require("./Renderer");

window.onload = function() {
  
  var cviewport = document.getElementById("game-viewport");
  var cworld = document.getElementById("game-world");

  window.Utils = new Utils();  
  window.Time = new GameTime();

  window.Controls = new Controls({
    container: cviewport
  });

  var Game = require("./Game");

  window.config = require("./Settings");

  window.config.size = {
    x: 1000,
    y: 600
  };

  window.game = new Game({
    viewport: cviewport,
    world: cworld
  });

  window.game.start();
};
},{"./Controls":1,"./Game":2,"./GameTime":3,"./Mathf":5,"./Physics":10,"./Renderer":11,"./Settings":12,"./Utils":13,"./Vector":14,"./reqAnimFrame":16}],16:[function(require,module,exports){
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
},{}]},{},[15]);
