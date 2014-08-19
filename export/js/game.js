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

var Desktop = module.exports = function(options){
  this.container = options.container || window.document;

  this.events = {
      "pressing": null
    , "moving": null
    , "release": null
    , "element": null
    , "blowing:on": null
    , "blowing:off": null
    , "pause": null
  };

  this.enabled = false;

  this.onMouseUp = this._onMouseUp.bind(this);
  this.onMouseDown = this._onMouseDown.bind(this);
  this.onMouseMove = this._onMouseMove.bind(this);
  
  this.keyUp = this._onKeyUp.bind(this);
  this.keyDown = this._onKeyDown.bind(this);

  this.container.onmouseup = this.onMouseUp;
  this.container.onmousedown = this.onMouseDown;
  this.container.onmousemove = this.onMouseMove;
  window.document.onkeyup = this.keyUp;
  window.document.onkeydown = this.keyDown;
};

Desktop.prototype.enable = function(){
  this.enabled = true;
  return this;
};

Desktop.prototype.disable = function(){
  this.enabled = false;
  return this;
};

Desktop.prototype.on = function(evName, callback){
  if (!this.events[evName]){
    this.events[evName] = [];
  }

  this.events[evName].push(callback);

  return this;
};

Desktop.prototype.off = function(evName){
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

Desktop.prototype._getEventName = function(e){
  var key = e.which || e.keyCode;
  switch(key){
    case 81: //Q
    case 113: //q
      return "element:fire";
    case 87: //W
    case 119: //w
      return "element:water";
    case 69: //E
    case 101: //e
      return "element:earth";
    case 82: //R
    case 114: //r
      return "blowing";

    case 112: //P
    case 80: //p
      return "pause";
  }

  return;
};

Desktop.prototype._onKeyUp = function(e){
  var evName = this._getEventName(e);

  if (!this.enabled && evName !== "pause"){
    return;
  }

  if (evName){

    if (evName === "blowing"){
      evName += ":off";
    }
    else if (evName.indexOf("element") > -1){
      var element = evName.split(":")[1];
      this.events.element.forEach(function(cb){
        cb(element);
      });

      return;
    }

    this.events[evName].forEach(function(cb){
      cb();
    });
  }
};

Desktop.prototype._onKeyDown = function(e){
  if (!this.enabled){
    return;
  }

  var evName = this._getEventName(e);

  // for now only blow for key down
  if (evName !== "blowing"){
    return;
  }

  this.events[evName + ":on"].forEach(function(cb){
    cb();
  });
};

Desktop.prototype._onMouseUp = function(e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events.release.forEach(function(cb){
    cb(pos);
  });
};

Desktop.prototype._onMouseDown = function(e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events.pressing.forEach(function(cb){
    cb(pos);
  });
};

Desktop.prototype._onMouseMove = function(e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events.moving.forEach(function(cb){
    cb(pos);
  });
};
},{}],3:[function(require,module,exports){

var Cursor = module.exports = function(){
  this.pos = { x: 0, y: 0 };
  this.size = 20;

  this.coldColor = [0,0,255,0.5];
  this.burnColor = [255,0,0,0.4];
  this.earthColor = [165,140,80,0.4];

  this.color = [255,255,255,0.5];

  this.active = false;
  this.element = "fire";
  this.blowing = false;

  Controls.on("pressing", this.onPressing.bind(this));
  Controls.on("moving", this.onMoving.bind(this));
  Controls.on("release", this.onRelease.bind(this));
  Controls.on("element", this.onElement.bind(this));
  Controls.on("blowing:on", this.onBlowing.bind(this));
  Controls.on("blowing:off", this.onStopBlowing.bind(this));
};

Cursor.prototype.onPressing = function(pos){
  this.pos = pos;
  this.active = true;
};

Cursor.prototype.onMoving = function(pos){
  this.pos = pos;
};

Cursor.prototype.onRelease = function(){
  this.active = false;
};

Cursor.prototype.onElement = function(element){
  this.element = element;
};

Cursor.prototype.onStopBlowing = function(){
  this.blowing = false;
};

Cursor.prototype.onBlowing = function(){
  this.blowing = true;
};

Cursor.prototype.update = function(){
  switch(this.element){
    case "fire":
      this.color = this.burnColor;
      break;
    case "water":
      this.color = this.coldColor;
      break;
    case "earth":
      this.color = this.earthColor;
      break;
  }
};

Cursor.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color),
    stroke: {
      color: "#fff",
      size: 2
    } 
  });

};
},{}],4:[function(require,module,exports){

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
  Controls.enable();
  this.gameRun();
};

Game.prototype.stop = function(){
  this.paused = true;
  Controls.disable();
  window.cancelAnimationFrame(this.tLoop);
};

Game.prototype.gameRun = function(){
  if (Time.tick()) { this.loop(); }
  this.tLoop = window.requestAnimationFrame(this.boundGameRun);
};

},{"./Manager":6}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){

var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Cursor = require("./Cursor");
var Spiders = require("./Spiders");

var Manager = module.exports = function(){
  this.cursor = new Cursor();
  this.nodes = new Nodes();
  this.paths = new Paths();

  function set(id, value){
    var ele = document.getElementById(id);
    if (ele) { ele.innerText = value; }
  }

  this.spiders = new Spiders(this.nodes, function(stats){
    for (var p in stats){
      if (stats.hasOwnProperty(p)){
        set(p, stats[p]);
      }
    }
  });
};

Manager.prototype.update = function(){
  
  this.cursor.update();

  window.blowing = this.cursor.blowing;

  if (this.cursor.active){
    this.nodes.applyPos = this.cursor.pos;
    this.nodes.applyRatio = this.cursor.size;
    this.nodes.element = this.cursor.element;
  }
  else {
    this.nodes.applyPos = null;
  }

  this.nodes.update();
  this.spiders.update();
};

Manager.prototype.draw = function(viewCtx, worldCtx){
  var s = config.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);

  this.cursor.draw(viewCtx);
  this.nodes.draw(worldCtx);
  this.spiders.draw(worldCtx);
};
},{"./Cursor":3,"./Nodes":9,"./Paths":11,"./Spiders":17}],7:[function(require,module,exports){

var Mathf = {};

Mathf.rnd = function(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
};

Mathf.rnd11 = function(){
  return Math.round(Math.random());
};

Mathf.rnd01 = function(){
  return Math.random();
};

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

Mathf.polygonPoints = function(center, radius, sides) {
  var points = [];
  var angle = (Math.PI * 2) / sides;

  for (var i = 0; i < sides; i++) {
    points.push({
      x: center.x + radius * Math.cos(i * angle),
      y: center.y + radius * Math.sin(i * angle)
    });
  }

  return points;
};

module.exports = Mathf;

},{}],8:[function(require,module,exports){

var Node = module.exports = function(pos){
  
  this.id = _.guid("nodes");

  this.pos = pos;
  this.size = config.nodes.size;

  this.color = config.nodes.colors.cold;
  this.dColor = Color.toRGBA(this.color);

  this.nears = [];
  this.selected = false;

  this.temp = 0;
  this.incTemp = 0;
  this.incTempSize = 0;

  this.burned = false;
  this.shaked = false;
  this.originalPos = null;
  this.hasEarth = false;

  this.target = false;
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
};

Node.prototype.randomBurn = function(){
  
  var oneBurned = this.nears.some(function(node){
    return node.burned;
  });

  if (!oneBurned && Mathf.rnd01() < 0.15){
    this.setBurned();
  }
};

Node.prototype.getNearBurned = function(){
  
  var burned;
  this.nears.some(function(node){
    if (node.burned){
      burned = node;
      return true;
    }
  });

  return burned;
};

Node.prototype.shake = function(){
  if (this.originalPos){
    this.pos = this.originalPos;
  }
  else {
    this.originalPos = this.pos;
  }
  
  this.shaked = true;
  this.pos = Vector.round(Vector.add(this.pos, Mathf.rndInCircle(0.2)));
};

Node.prototype.endShake = function(){
  if (this.originalPos){
    this.pos = this.originalPos;
  }
  this.shaked = false;
};

Node.prototype.revive = function(){
  if (this.burned){
    this.resetTemp();
    this.burned = false;
  }
};

Node.prototype.burn = function(){
  if (!this.burned){
    this.incTemp = 1;
  }
};

Node.prototype.cool = function(){
  if (!this.burned){
    this.incTemp = -1;
    this.incTempSize = 0.5;
  }
};

Node.prototype.applyEarth = function(){
  if (!this.burned && !this.target){
    this.hasEarth = true;
  }
};

Node.prototype.getRandomNear = function(excludeId){
  var ns = [];

  this.nears.forEach(function(n){
    if (n.id !== excludeId && !n.burned && n.temp < 0.5){
      ns.push(n);
    }
  });

  if (ns.length > 0){
    var idx = Mathf.rnd(0, ns.length-1);
    return ns[idx];
  }

  return null;
};

Node.prototype.resetTemp = function(){
  this.temp = 0;
  this.incTemp = 0;
  this.incTempSize = 0;
};

Node.prototype.setBurned = function(){
  if (this.target){
    return;
  }

  this.burned = true;
  this.color = config.nodes.colors.burned;
  this.dColor = Color.toRGBA(this.color);
};

Node.prototype.update = function(){

  if (this.target){
    this.size = config.nodes.targetSize;
    this.dColor = Color.toRGBA(config.nodes.colors.target);
    return;
  }

  if (this.hasEarth){
    this.dColor = Color.toRGBA(config.nodes.colors.earth);
    this.resetTemp();
    return;
  }

  var isAlone = this.nears.every(function(n){
    return n.burned;
  });

  if (isAlone){
    this.setBurned();
    return;
  }

  if (this.incTemp > 0){ // is burning
    if (window.blowing) {    
      this.incTempSize = 0.2; 
    }
    else {
      this.incTempSize = 0.1; 
    }
  }

  if (window.blowing) {
    this.shake();
  }
  else if (this.shaked){
    this.endShake();
  }

  this.temp += this.incTemp * this.incTempSize * Time.deltaTime;

  if (this.temp <= 0){
    this.resetTemp();
  }

  this.color = Color.lerp(config.nodes.colors.cold, config.nodes.colors.burn, this.temp);
  this.dColor = Color.toRGBA(this.color);

  if (this.temp > 1){
    this.setBurned();
    this.resetTemp();
    return;
  }

};

Node.prototype.draw = function(ctx){
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.dColor
  });

};
},{}],9:[function(require,module,exports){
/*jslint -W083 */

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(){

  this.nodes = [];
  this.paths = new Paths();

  //var marginW = 200;
  //var marginH = 10;

  var marginW = 200;
  var marginH = 50;
  
  // Full-screen
  var radius = Vector.divide(config.size, 2);

  // Full-screen with margin
  radius.x -= marginW;
  radius.y -= marginH;

  // Square of half-height
  //var radius = Vector.multiply(Vector.one, config.size.y/2 - 10);

  // Half-screen
  //var radius = Vector.divide(config.size, 2);


  // Center of Screen
  var center = Vector.center(Vector.zero, config.size);

  this.createWeb(center, radius);

  this.applyPos = null;
  this.applyRatio = 0;
  this.element = null;

};

Nodes.prototype.createWeb = function(center, rad){

  var ringsAm = 0
    , ringsGap = 30
    , rndRadius = ringsGap/5
    , nodesByRing = 6
    , duplicateBy = 3
    , increaseBy = 2
    , maxNodesByRing = nodesByRing * 8 // 8 times increase max
    , boundMin = Vector.add(center, Vector.multiply(rad, -1))
    , boundMax = Vector.add(center, rad)
    , rings = [];
 
  var cNode = new Node(center);
  this.nodes.push(cNode);

  var start = 10;
  var i = 1;
  var aNodeInside;

  var countNodes = 0;

  do {
    aNodeInside = false;

    if (i % duplicateBy === 0){
      nodesByRing *= increaseBy;
    }
    if (nodesByRing > maxNodesByRing){
      nodesByRing = maxNodesByRing;
    }

    var ps = Mathf.polygonPoints(center, (i*ringsGap) + start, nodesByRing);
    countNodes += ps.length;
    var cRing = [];

    if (i === 10 || i === 20){
      rndRadius += 0.1;
    }

    ps.forEach(function(p){

      var np = Vector.round(Vector.add(p, Mathf.rndInCircle(rndRadius)));
      var node = new Node(np);
      
      if (Vector.isOut(np, boundMin, boundMax)) {
        node.out = true;
      }
      else {
        aNodeInside = true;
        this.nodes.push(node);
      }
      
      cRing.push(node);

    }, this);

    rings[i-1] = cRing;
    i++;

  } while(aNodeInside);

  ringsAm = i-2;

  
  // path from center to first ring
  rings[0].forEach(function(rNode){
    this.paths.addOne(cNode, rNode);
  }, this);

  var j, k, l1, l2;

  // Paths connections between rings
  for (j=0; j<ringsAm; j++){
    var currRing = rings[j];
    var max = currRing.length;

    for (k=0; k<max; k++){

      l1 = k+1;
      l2 = k*increaseBy;
      if (l1 > max-1){
        l1 = 0;
      }

      if (l2 > (max*increaseBy)-duplicateBy){
        l2 = -increaseBy;
      }

      var currNode = rings[j][l1];
      if (currNode.out){
        continue;
      }

      var nextRing = rings[j+1];
      var rSiblingA = nextRing[l1];

      if (nextRing.length > currRing.length) {
         rSiblingA = nextRing[l2+increaseBy]; 
      }
      
      if (j < ringsAm-1){
        if (rSiblingA && !rSiblingA.out){
          this.paths.addOne(currNode, rSiblingA);
        }
      }

      var sibling = rings[j][k];
      if (!sibling.out){
        this.paths.addOne(currNode, sibling);
      }

    }
  }

  // burn some nodes randomly
  this.nodes.forEach(function(node){
    node.randomBurn();
  });

  // sort a target node
  var sorted = false;
  var len = this.nodes.length-1;
  while(!sorted) {

    var idx = Mathf.rnd(0, len);
    var node = this.nodes[idx];

    if (!node.burned){
      node.target = true;
      sorted = true;
    }
  }

};

Nodes.prototype.findNodeByCollider = function(){
  
  this.nodes.forEach(function (node) {
    if (this.applyPos && Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
      //TODO: break each when found one and 
      // add a timer so it won't get busy appling the same several times
      switch(this.element){
        case "fire":
          node.burn();
          break;
        case "water":
          node.cool();
          break;
        case "earth":
          node.applyEarth();
          break;
      }
    }
  }, this);

};

Nodes.prototype.GetNodes = function(){
  return this.nodes;
};

Nodes.prototype.update = function(){

  if (this.applyPos){
    this.findNodeByCollider();
  }

  this.paths.update();

  this.nodes.forEach(function (node) {
    if (!node.burned){
      node.update();
    }
  });

};

Nodes.prototype.draw = function(ctx){

  this.paths.draw(ctx);

  this.nodes.forEach(function (node) {
    node.draw(ctx);
  });

};
},{"./Node":8,"./Paths":11}],10:[function(require,module,exports){

var Path = module.exports = function(na, nb){
  this.na = na;
  this.nb = nb;

  this.size = config.paths.size;
  this.tBurn = config.paths.tBurn;

  this.burned = false;
};

Path.prototype.update = function(){
  var naT = this.na.temp
    , nbT = this.nb.temp
    , naC = this.na.color
    , nbC = this.nb.color;

  if (naT > this.tBurn && nbT === 0){
    this.nb.burn();
  }
  else if (nbT > this.tBurn && naT === 0){
    this.na.burn();
  }

  if (Color.eql(naC,  nbC)){
    this.color = Color.toRGBA(naC);
  }
  else {
    this.color = Color.toRGBA(Color.lerp(naC, nbC, this.tBurn));
  }

  if (this.na.burned || this.nb.burned) {
    this.burned = true;
    this.color = Color.toRGBA(config.paths.colors.burned);
  }

};

Path.prototype.draw = function(ctx){
  Renderer.drawLine(ctx, {
    from: this.na.pos,
    to: this.nb.pos,
    size: this.size,
    color: this.color
  });

};
},{}],11:[function(require,module,exports){

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
    this.paths.push(new Path(nA, nB));
  }
};

Paths.prototype.update = function(){
  this.paths.forEach(function (path) {
    //if (!path.burned){
      path.update();
    //}
  });
};

Paths.prototype.draw = function(ctx){
  this.paths.forEach(function (path) {
    path.draw(ctx);
  });
};
},{"./Path":10}],12:[function(require,module,exports){

var Physics = {};

Physics.test = function(x, y){
  return { x: x, y: y};
};

module.exports = Physics;

},{}],13:[function(require,module,exports){

var Renderer = {};

Renderer.drawCircle = function(ctx, ps){
  ctx.beginPath();
  ctx.arc(ps.pos.x, ps.pos.y, ps.radius, 0, 2 * Math.PI, false);
  ctx.fillStyle = ps.color;
  ctx.fill();

  if (ps.stroke){
    ctx.lineWidth = ps.stroke.size || 1;
    ctx.strokeStyle = ps.stroke.color || "#000";
    ctx.stroke();
  }
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

Renderer.drawSprite = function(ctx, ps){
  var img = Repo[ps.resource]
    , x = ps.pos.x
    , y = ps.pos.y
    , w = ps.size.x
    , h = ps.size.y
    , sp = ps.sp;

  function draw(){
    if (sp){
      ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, x, y, w, h);
    }
    else {
      ctx.drawImage(img, x, y, w, h);
    }
  }

  if (ps.angle){
    ctx.save();

    ctx.translate(x + w/2, y + h/2);
    x = -w/2;
    y = -h/2;
    ctx.rotate(ps.angle);

    draw();

    ctx.restore();
  }

  draw();
};

/*
Renderer.drawRect = function(ctx, ps){
  ctx.beginPath();
  
  ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
  //ctx.fillStyle = ps.color || "yellow";
  //ctx.fill();

  ctx.lineWidth = 1;
  ctx.strokeStyle = 'red';
  ctx.stroke();
};
*/
module.exports = Renderer;

},{}],14:[function(require,module,exports){

module.exports = (function(){
  var resources = {}
    , loaded = 0
    , getCount = function(){
        return Object.keys(resources).length;
      };
  
  var events = {
      complete: function(){}
    , report: function(){}
    , error: function(){}
  };

  var imageLoaded = function() {
    var current = getCount();
    var prg = (++loaded * 100) / current;

    if (loaded <= current){
      events.report(prg);

      if (prg >= 100) { 
        events.complete();
      }
    }
  };
  
  var imageFailed = function(evt, etc){
    events.error(evt, etc);       
  };

  return {
    on: function(eventName, callback){
      if (events[eventName]) {
        events[eventName] = callback;
      }
      return this;
    },
    
    load: function(){
      loaded = 0;
      for (var img in resources) {
        if (resources.hasOwnProperty(img)){
          this[img] = new window.Image();
          this[img].onload = imageLoaded;
          this[img].onerror = imageFailed;
          this[img].src = resources[img];
        }
      }
      return this;
    },
    
    addResources: function(newResources){
      for(var r in newResources){
        if (newResources.hasOwnProperty(r)){
          resources[r] = newResources[r];
        }
      }
      return this;
    }
    
  };
  
})();
},{}],15:[function(require,module,exports){

module.exports = {

  nodes: {
      size: 3
    , targetSize: 6
    , colors: {
        cold: [255,255,255,1]
      , burn: [255,0,0,1]
      , burned: [0,0,0,0.2]
      , earth: [190,160,40,1]
      , target: [0,0,255,1]
    }
  },

  paths: {
      size: 2
    , tBurn: 0.5
    , colors: {
        burned: [0,0,0,0.2]
    }
  },

  spiders: {
      size: 20
    , quantity: 50
    , color: [115,255,0]
    , speed: 0.05
    , speedAlert: 0.1
    , behaviour: {
        alertTemp: 0
      , tStayA: 3000
      , tStayB: 10000
    }
  },

  images: {  
      "spider": "images/spider.gif"
  }

};

},{}],16:[function(require,module,exports){

var Spider = module.exports = function(pos, onDead){
  this.id = _.guid("spiders");

  var cfg = config.spiders;

  this.pos = Vector.round(pos);
  this.onDead = onDead;

  this.size = cfg.size;
  this.color = cfg.color;
  this.speed = cfg.speed;

  this.nFrom = null;
  this.nTo = null;
  this.journeyLength = null;

  this.traveling = false;
  this.isDead = false;

  this.temp = 0;
  this.staying = false;

  this.t_stay = 2000;
  this.t_startStay = 0;
  this.t_nextStay = 0;

  this.t_startMove = 0;

  this.building = false;

  this.spSize = Vector.multiply(Vector.one, this.size);
  this.spPos = Vector.origin(this.pos, this.spSize);

  this.angle = 0;
};

Spider.prototype.setNode = function(nFrom, nTo){
  this.nFrom = nFrom;
  this.nTo = nTo;

  this.t_startMove = Time.time;
  this.journeyLength = Vector.length(nFrom.pos, nTo.pos);
  this.traveling = true;

  this.angle = Vector.angleTo(this.pos, this.nTo.pos);
};

Spider.prototype.setDead = function(){
  if (!this.isDead){
    this.isDead = true;
    this.onDead();
  }
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
    this.nTo.revive();
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

  this.spPos = Vector.origin(this.pos, this.spSize);

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
  
  if (this.building){
    Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.nFrom.pos,
      size: config.paths.size,
      color: Color.toRGBA(config.nodes.colors.cold)
    });
  }

/*
  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: Color.toRGBA(this.color)
  });
*/

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: this.spPos,
    size: this.spSize,
    angle: this.angle,
    sp: {
      x: 0,
      y: 0,
      w: 32,
      h: 32
    }
  });  
};

},{}],17:[function(require,module,exports){

var Spider = require("./Spider");

var Spiders = module.exports = function(nodes, onExitSpider){
  this.nodes = nodes;
  this.onExitSpider = onExitSpider;

  this.amount = config.spiders.quantity;

  this.spiders = [];

  this.spidersExit = 0;
  this.spidersKilled = 0;

  this.generateSpiders();

  this.updateGUI();
};

Spiders.prototype.updateGUI = function(){
  this.onExitSpider({
    saved: this.spidersExit,
    killed: this.spidersKilled,
    alives: this.spiders.length - (this.spidersKilled + this.spidersExit),
    total: this.spiders.length
  });
};

Spiders.prototype.onSpiderDead = function(){
  this.spidersKilled++;
  this.updateGUI();
};

Spiders.prototype.generateSpiders = function(){
  var nodes = this.nodes.GetNodes()
    , len = nodes.length
    , nodesIds = []
    , node
    , idx
    , amount = (len < this.amount ? len-2: this.amount);

  do {
    idx = Mathf.rnd(0, len-1);
    node = nodes[idx];

    if (!node.target && !node.burned && nodesIds.indexOf(node.id) === -1){
      nodesIds.push(node.id);
      this.spiders.push(new Spider(node.pos, this.onSpiderDead.bind(this)));
      amount--;
    }
  } while(amount);
};

Spiders.prototype.exitSpider = function(spider){
  spider.exited = true;
  this.spidersExit++;
  this.updateGUI();
};

Spiders.prototype.update = function(){

  var nodes = this.nodes.GetNodes();

  this.spiders.forEach(function (spider) {

    if (!spider.exited){

      if (!spider.traveling){
        nodes.some(function (node) {

          if (Vector.pointInCircle(spider.pos, node.pos, 5)) {

            if (node.target){
              this.exitSpider(spider);
              return true;
            }

            if (!node.hasEarth && node.temp === 0 && Mathf.rnd01() > 0.7) {
              var nearBurned = node.getNearBurned();
              if (nearBurned){
                spider.buildWeb(node, nearBurned);
                return true;
              }
            }

            var fromId = (spider.nodeFrom && spider.nodeFrom.id) || -1;
            var nodeTo = node.getRandomNear(fromId);
            if (nodeTo){
              spider.setNode(node, nodeTo);
            }
            else {
              if(node.burned){
                spider.setDead();
              }
            }
          }

        }, this);
      }
    
      spider.update();
    }

  }, this);
};

Spiders.prototype.draw = function(ctx){
  this.spiders.forEach(function (spider) {
    if (!spider.exited){
      spider.draw(ctx);
    }
  });
};
},{"./Spider":16}],18:[function(require,module,exports){

var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0,
    spiders: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};

},{}],19:[function(require,module,exports){

var Vector = {};

Vector.zero = { x: 0, y: 0 };
Vector.one = { x: 1, y: 1 };

Vector.multiply = function(vector, delta){
  return { x: vector.x * delta, y: vector.y * delta };
};

Vector.divide = function(vector, delta){
  return { x: vector.x / delta, y: vector.y / delta };
};

Vector.add = function(a, b){
  return { x: a.x + b.x, y: a.y + b.y };
};

Vector.dif = function(from, to){
  return { x: to.x - from.x, y: to.y - from.y };
};

// get "which" part of a point between 2 (i.e. 4th part)
Vector.part = function(from, to, which){
  return Vector.lerp(from, to, which/10);
};

Vector.angleTo = function(from, to){
  var p = Vector.dif(from, to);
  return Math.atan2(p.y, p.x);
};

// get mid point between 2
Vector.mid = function(from, to){
  return Vector.divide(Vector.add(from, to), 2);
};

Vector.eql = function(a, b){
  return (a.x === b.x && a.y === b.y);
};

Vector.origin = function(pos, size){
  return {
      x: pos.x - size.x/2,
      y: pos.y - size.y/2,
  };
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

Vector.isOut = function(p, min, max){
  return (p.x < min.x || p.x > max.x || p.y < min.y || p.y > max.y);
};

Vector.debug = function(vec){
  console.log(vec.x + " : " + vec.y);
};

module.exports = Vector;

},{}],20:[function(require,module,exports){
var w = window;
var doc = w.document;

w.DEBUG = true;

require("./reqAnimFrame");

var Game = require("./Game");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");

w.Mathf = require("./Mathf");
w.Color = require("./Color");
w.Vector = require("./Vector");
w.Physics = require("./Physics");
w.Renderer = require("./Renderer");
w.Repo = require("./Repo");

function configGame(){
  var cfg = require("./Settings")
    , ele = doc.documentElement
    , body = doc.body;

  function getSize(which){
    return Math.max(
      ele["client" + which], 
      body["scroll" + which], 
      ele["scroll" + which], 
      body["offset" + which], 
      ele["offset" + which]
    );
  }

  cfg.size = {
    x: getSize("Width") - 50,
    y: getSize("Height") - 50
  };

  w.config = cfg;
}

function initGame(){
  var cviewport = doc.getElementById("game-viewport");
  var cworld = doc.getElementById("game-world");

  w._ = new Utils();  
  w.Time = new GameTime();

  w.Controls = new Controls({
    container: cviewport
  });

  w.game = new Game({
    viewport: cviewport,
    world: cworld
  });

  function pauseGame(){
    if (game.paused){
      game.start();
    }
    else {
      game.stop(); 
    }
  }

  w.Controls.on('pause', pauseGame);
}

function onDocLoad(){
  configGame();

  w.Repo.addResources(w.config.images)
    .on('error', function(err){
      console.log(err);
    })
    .on('report', function(prg){
      console.log("Images loaded: " + prg);
    })
    .on('complete', function(){
      initGame();
      w.game.start();
    })
    .load();
}

w.onload = onDocLoad;

},{"./Color":1,"./Controls":2,"./Game":4,"./GameTime":5,"./Mathf":7,"./Physics":12,"./Renderer":13,"./Repo":14,"./Settings":15,"./Utils":18,"./Vector":19,"./reqAnimFrame":21}],21:[function(require,module,exports){
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
},{}]},{},[20]);
