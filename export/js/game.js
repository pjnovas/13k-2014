(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var Color = {};

Color.toRGBA = function(arr){
  return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + (arr[3] || 1) + ")";
};

Color.lerp = function(from, to, t){
  var fromA = from[3] === undefined ? 1 : from[3];
  var toA = to[3] === undefined ? 1 : to[3];

  var r = Math.round(Mathf.lerp(from[0], to[0], t));
  var g = Math.round(Mathf.lerp(from[1], to[1], t));
  var b = Math.round(Mathf.lerp(from[2], to[2], t));
  var a = Math.round(Mathf.lerp(fromA, toA, t) * 100) / 100;

  return [r,g,b,a];
};

Color.eql = function(a, b){
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

module.exports = Color;

},{}],2:[function(require,module,exports){

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
},{}],3:[function(require,module,exports){

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

},{"./Manager":5}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){

var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Spiders = require("./Spiders");

var Manager = module.exports = function(){
  
  var wParts = 80;
  var hParts = 22;

  this.nodes = new Nodes({
    rows: Math.round(config.size.x / wParts),
    cols: Math.round(config.size.y / hParts),
    nodeSize: 3
  });

/*
  this.nodes = new Nodes({
    rows: 30,
    cols: 45,
    nodeSize: 3
  });
*/
  this.paths = new Paths({
    nodes: this.nodes
  });

  this.spiders = new Spiders({
    nodes: this.nodes,
    amount: 100
  });
};

Manager.prototype.update = function(){
  //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
  this.nodes.update();
  this.spiders.update();
};

Manager.prototype.draw = function(viewCtx, worldCtx){
  var s = config.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);

  this.nodes.draw(worldCtx);
  this.spiders.draw(worldCtx);
};
},{"./Nodes":8,"./Paths":10,"./Spiders":15}],6:[function(require,module,exports){

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

Mathf.lerp = function(a, b, u) {
  return (1 - u) * a + u * b;
};

module.exports = Mathf;

},{}],7:[function(require,module,exports){

var Node = module.exports = function(opts){
  this.id = Utils.guid("nodes");

  this.row = opts.row;
  this.col = opts.col;

  this.pos = opts.pos;
  this.size = opts.size;

  this.coldColor = [255,255,255,1];
  this.burnColor = [255,0,0,1];
  
/*
  this.coldColor = [0,0,0,1];
  this.burnColor = [255,0,0,1];
*/

  this.color = this.coldColor;

  this.nears = [];
  this.selected = false;

  this.increaseTempSize = 0.1;

  this.temp = 0;
  this.increaseTemp = 0;
  this.burnTemp = 1;

  this.collider = 1;
  this.colliderTemp = 40;

  this.burned = false;
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
};

Node.prototype.burn = function(){
  this.increaseTemp = 1;
};

Node.prototype.cool = function(){
  this.increaseTemp = -1;
};

Node.prototype.getRandomNear = function(excludeId){
  var ns = [];

  this.nears.forEach(function(n){
    if (n.id !== excludeId && !n.burned && n.temp < 0.5){
      ns.push(n);
    }
  });
/*
  if (ns.length === 0){
    this.nears.forEach(function(n){
      if (n.id !== excludeId && !n.burned){
        ns.push(n);
      }
    });
  }
*/
  if (ns.length > 0){
    var idx = Mathf.rnd(0, ns.length-1);
    return ns[idx];
  }

  return null;
};

Node.prototype.getRandomNearB = function(excludeId){
  var ns = [];

  this.nears.forEach(function(n){
    if (n.id !== excludeId && !n.burned){
      ns.push(n);
    }
  });

  if (ns.length > 0){
    ns.sort(function(na, nb){
      return na.temp - nb.temp;
    });

    if (ns[0].temp < 0.5){
      return ns[0];
    }

    var found = null; 
    ns.forEach(function(n){
      if (n.temp < 0.5){
        found = n;
        return true;
      }
    });

    return found || ns[0];
  }

  return null;
};

Node.prototype.setBurned = function(){
  this.burned = true;
};

Node.prototype.update = function(){

  if (this.burned){
    return;
  }

  var isAlone = this.nears.every(function(n){
    return n.burned;
  });

  if (isAlone){
    this.setBurned();
  }

  this.temp += this.increaseTemp * this.increaseTempSize * Time.deltaTime;

  if (this.temp <= 0){
    this.temp = 0;
  }

  this.color = Color.lerp(this.coldColor, this.burnColor, this.temp);

  if (this.temp > 1){
    this.setBurned();
    return;
  }

  this.collider = this.temp ? this.temp * this.colliderTemp : 1 ;

};

Node.prototype.draw = function(ctx){

  if (this.burned){
    return;
  }
/*
  //debug collider
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.collider,
    color: "rgba(255,0,0,0.5)"
  });
*/

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color)
  });

};
},{}],8:[function(require,module,exports){

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
        pos: Vector.round(Vector.add(center, point)),
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
      node.burn();
    }
  });

};

Nodes.prototype.GetNodes = function(){
  return this.nodes;
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
},{"./Node":7,"./Paths":10}],9:[function(require,module,exports){

var Path = module.exports = function(opts){
  this.na = opts.na;
  this.nb = opts.nb;

  this.size = 2;

  this.burned = false;
};

Path.prototype.update = function(){
  if (this.burned){
    return;
  }

  this.burned = (this.na.burned || this.nb.burned);
  if (this.burned){
    return;
  }

  var naT = this.na.temp;
  var nbT = this.nb.temp;

  if (naT > 0.5 && nbT === 0){
    this.nb.burn();
  }
  else if (nbT > 0.5 && naT === 0){
    this.na.burn();
  }

  if (Color.eql(this.na.color,  this.nb.color)){
    this.color = Color.toRGBA(this.na.color);
  }
  else {
    this.color = Color.toRGBA(Color.lerp(this.na.color, this.nb.color, 0.5));
  }

};

Path.prototype.draw = function(ctx){
  if (this.burned){
    return;
  }

  //if (Color.eql(this.na.color,  this.nb.color)){
  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

  /*
  else { toooooo expensive (blows in Mozilla)
    Renderer.drawLinGradient(ctx, {
      from: this.na.pos,
      to: this.nb.pos,
      size: this.size,
      colorFrom: Color.toRGBA(this.na.color),
      colorTo: Color.toRGBA(this.nb.color)
    });
  }
  */

};
},{}],10:[function(require,module,exports){

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
},{"./Path":9}],11:[function(require,module,exports){

var Physics = {};

Physics.test = function(x, y){
  return { x: x, y: y};
};

module.exports = Physics;

},{}],12:[function(require,module,exports){

var Renderer = {};

//Renderer.grads = [];

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
/*
Renderer.drawLinGradient = function(ctx, ps){
  var a = ps.from
    , b = ps.to
    , cA = ps.colorFrom
    , cB = ps.colorTo
    , gid = a.x +"."+ a.y +"."+ b.x +"."+ b.y +"."+ cA +"."+ cB
    , grad = Renderer.grads[gid];

  if (!grad){
    grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    grad.addColorStop(0, cA);
    grad.addColorStop(1, cB);
    Renderer.grads[gid] = grad;
  }

  ctx.strokeStyle = grad;

  ctx.beginPath();

  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);

  ctx.lineWidth = ps.size;
  ctx.stroke();
};
*/
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

},{}],13:[function(require,module,exports){

module.exports = {

  

};

},{}],14:[function(require,module,exports){

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

},{}],15:[function(require,module,exports){

var Spider = require("./Spider");

var Spiders = module.exports = function(opts){
  this.nodes = opts.nodes;
  this.amount = opts.amount;

  this.spiders = [];

  this.generateSpiders();
};

Spiders.prototype.generateSpiders = function(){
  var nodes = this.nodes.GetNodes();
  var len = nodes.length;

  var nodesIds = [];

  for (var i=0; i<this.amount; i++){
    var index = Mathf.rnd(0, len-1);
    var node = nodes[index];

    if (nodesIds.indexOf(node.id) === -1){
      nodesIds.push(node.id);

      this.spiders.push(new Spider({
        pos: node.pos
      }));
    }
  }
};

Spiders.prototype.update = function(){

  var nodes = this.nodes.GetNodes();

  this.spiders.forEach(function (spider) {

    if (!spider.traveling){
      nodes.forEach(function (node) {

        if (Vector.pointInCircle(spider.pos, node.pos, 5)) {
          var fromId = (spider.nodeFrom && spider.nodeFrom.id) || -1;
          var nodeTo = node.getRandomNear(fromId);
          if (nodeTo){
            spider.setNode(node, nodeTo);
          }
          else {
            if(node.burned){
              spider.setDead();
            }
            else {
              spider.setNode(node, spider.nodeFrom);
            }
          }
        }

      });
    }
    spider.update();
  });
};

Spiders.prototype.draw = function(ctx){
  this.spiders.forEach(function (spider) {
    spider.draw(ctx);
  });
};
},{"./Spider":14}],16:[function(require,module,exports){

var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};
},{}],17:[function(require,module,exports){

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

Vector.length = function(a, b){
  var dif = Vector.dif(a, b);
  return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
};

Vector.pointInCircle = function(p, pos, radius){
  return Vector.length(p, pos) < radius;
};

Vector.lerp = function(from, to, t){

  return {
    x: from.x + (to.x - from.x) * t,
    y: from.y + (to.y - from.y) * t
  };

};

Vector.round = function(v){
  v.x = Math.round(v.x);
  v.y = Math.round(v.y);
  return v;
};

/*
Vector.debug = function(vec){
  console.log(vec.x + " : " + vec.y);
};
*/
module.exports = Vector;

},{}],18:[function(require,module,exports){

require("./reqAnimFrame");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");

window.Mathf = require("./Mathf");
window.Color = require("./Color");
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

  function getSize(which){
    return Math.max(
      document.documentElement["client" + which], 
      document.body["scroll" + which], 
      document.documentElement["scroll" + which], 
      document.body["offset" + which], 
      document.documentElement["offset" + which]
    );
  }

  var width = getSize("Width");
  var height = getSize("Height");

  window.config.size = {
    x: width - 50,
    y: height - 50
  };

/*
  window.config.size = {
    x: 1850,
    y: 1000
  };
*/

  //console.log(width + ":" + height);

  window.game = new Game({
    viewport: cviewport,
    world: cworld
  });

  window.game.start();
};
},{"./Color":1,"./Controls":2,"./Game":3,"./GameTime":4,"./Mathf":6,"./Physics":11,"./Renderer":12,"./Settings":13,"./Utils":16,"./Vector":17,"./reqAnimFrame":19}],19:[function(require,module,exports){
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
},{}]},{},[18]);