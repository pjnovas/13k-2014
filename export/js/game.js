(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*
 * Taken from Backbone and Underscore
 * and only left the minimun and necessary code
 */


//TODO: centralize this in utilities

var _ = {};

var idCounter = 0;
_.uniqueId = function(prefix) {
  var id = ++idCounter + '';
  return prefix ? prefix + id : id;
};

_.isObject = function(obj) {
  var type = typeof obj;
  return type === 'function' || type === 'object' && !!obj;
};

_.extend = function(obj) {
  if (!_.isObject(obj)) { return obj; }
  var source, prop;
  for (var i = 1, length = arguments.length; i < length; i++) {
    source = arguments[i];
    for (prop in source) {
      if (hasOwnProperty.call(source, prop)) {
        obj[prop] = source[prop];
      }
    }
  }
  return obj;
};


// BASE CLASS 

var Base = module.exports = function(attributes) {

  if (_.isObject(attributes)){
    _.extend(this, attributes || {});
  }

  this.cid = _.uniqueId('c');
  
  this.initialize.apply(this, arguments);
};

_.extend(Base.prototype, {
  initialize: function(){},
});

Base.extend = function(protoProps, staticProps) {
  var parent = this;
  var child = function(){ return parent.apply(this, arguments); };
    
  _.extend(child, parent, staticProps);

  var Surrogate = function(){ this.constructor = child; };
  Surrogate.prototype = parent.prototype;
  child.prototype = new Surrogate();

  if (protoProps) { _.extend(child.prototype, protoProps); }
  child._super = parent.prototype;

  return child;
};

},{}],2:[function(require,module,exports){

module.exports = Entity.extend({

  pos: { x: 0, y: 0 },
  radius: 5,
  color: Color.white,
  stroke: null,

  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    Renderer.drawCircle(ctx, {
      pos: this.pos,
      radius: this.radius,
      color: Color.toRGBA(this.color),
      stroke: this.stroke
    });

  },

});

},{}],3:[function(require,module,exports){

module.exports = Base.extend({

  entities: [],

  initialize: function(){
    this.entities = [];
  },

  update: function(){
    this.entities.forEach(function (entity) {
      entity.update();
    });
  },

  draw: function(ctx){
    this.entities.forEach(function (entity) {
      entity.draw(ctx);
    });
  },

});

},{}],4:[function(require,module,exports){

var Color = {};

Color.white = [255,255,255,1];

Color.toRGBA = function(arr){
  return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + (arr[3] || 1) + ")";
};

Color.lerp = function(from, to, t){

  function l(a, b, t, m){
    m = m ? m : 1;
    return Math.round(Mathf.lerp(a, b, t) * m) / m;
  }

  return [
      l(from[0], to[0], t)
    , l(from[1], to[1], t)
    , l(from[2], to[2], t)
    , l(
        from[3] >= 0 ? from[3]: 1
      , to[3] >= 0 ? to[3] : 1
      , t
      , 100
      )
  ];
};

Color.eql = function(a, b){
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
};

module.exports = Color;

},{}],5:[function(require,module,exports){

function getCoordsEvent(e, canvas){
  var x, y
    , doc = document
    , body = doc.body
    , docEle = doc.documentElement;

  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  }
  else { 
    x = e.clientX + body.scrollLeft + docEle.scrollLeft; 
    y = e.clientY + body.scrollTop + docEle.scrollTop; 
  } 
  
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  
  return { x: x, y: y };
}

module.exports = Base.extend({

  events: {
      "pressing": null
    , "moving": null
    , "release": null
    , "element": null
    , "pause": null
  },

  enabled: false,

  initialize: function(options){
    var doc = window.document
      , c = this.container = options.container || doc;

    c.onmouseup = this._onMouseEvent.bind(this, "release");
    c.onmousedown = this._onMouseEvent.bind(this, "pressing");
    c.onmousemove = this._onMouseEvent.bind(this, "moving");
    doc.onkeyup = this._onKeyUp.bind(this);
  },

  enable: function(){
    this.enabled = true;
    return this;
  },

  disable: function(){
    this.enabled = false;
    return this;
  },

  on: function(evName, callback){
    if (!this.events[evName]){
      this.events[evName] = [];
    }

    this.events[evName].push(callback);

    return this;
  },

  off: function(evName){
    if (this.events[evName]){
      this.events[evName].length = 0;
    }

    return this;
  },

  _getEventName: function(e){
    switch(e.which || e.keyCode){
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
        return "element:air";
      case 112: //P
      case 80: //p
        return "pause";
    }

    return;
  },

  _onKeyUp: function(e){
    var evName = this._getEventName(e);

    if (!this.enabled && evName !== "pause"){
      return;
    }

    if (evName){

      if (evName.indexOf("element") > -1){
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
  },

  _onMouseEvent: function(type, e){
    if (!this.enabled){
      return;
    }

    var pos = getCoordsEvent(e, this.container);

    this.events[type].forEach(function(cb){
      cb(pos);
    });
  }

});

},{}],6:[function(require,module,exports){

module.exports = Circle.extend({

  radius: 20,
  stroke: {
    color: "#fff",
    size: 2
  },

  active: false,
  element: "fire",

  initialize: function(){
    Controls.on("pressing", this.onPressing.bind(this));
    Controls.on("moving", this.onMoving.bind(this));
    Controls.on("release", this.onRelease.bind(this));
    Controls.on("element", this.onElement.bind(this));
  },

  onPressing: function(pos){
    this.pos = pos;
    this.active = true;
  },

  onMoving: function(pos){
    this.pos = pos;
  },

  onRelease: function(){
    this.active = false;
  },

  onElement: function(element){
    this.element = element;
  },

  update: function(){
    var elements = ["fire", "water", "earth", "air"]
      , alpha = 0.4
      , sizes = [20,20,20,50]
      , colors = [
          [255,0,0, alpha]
        , [0,0,255, alpha]
        , [165,140,80, alpha]
        , [0,220,255, alpha]
      ];

    this.color = colors[elements.indexOf(this.element)];
    this.radius = sizes[elements.indexOf(this.element)];
  },

  //draw is used from inheritance by the Circle class

});

},{}],7:[function(require,module,exports){

var Elements = module.exports = function(){
  this.size = 96;
  this.pos = { x: 20, y: 50};

  this.spSize = Vector.multiply(Vector.one, this.size);

  this.current = null;
  this.active = false;
  this.selected = {};

  this.keys = {
    fire: "Q",
    water: "W",
    earth: "E",
    air: "R"
  };
};

Elements.prototype.update = function(){
  this.selected.air = window.blowing;
  
  this.selected.fire = false;
  this.selected.water = false;
  this.selected.earth = false;

  if (this.current){
    this.selected[this.current] = true;
  }
};

Elements.prototype.draw = function(ctx){
  var elementsSP = config.elements.sprites
    , gap = 50
    , i = 0;

  for (var ele in elementsSP){      
    var pos = { x: this.pos.x, y: this.pos.y + (i * (this.size + gap)) };

    Renderer.drawRect(ctx, {
      pos: pos,
      size: this.spSize,
      corner: 8,
      fill: (this.selected[ele] ? "white" : "transparent"),
      stroke: (this.active && this.current === ele ? "red" : "gray"),
      strokeWidth: 5
    });

    Renderer.drawSprite(ctx, {
      resource: "elements",
      pos: pos,
      size: this.spSize,
      angle: 0,
      sp: elementsSP[ele]
    });

    var txtPos = { x: pos.x, y: pos.y + this.spSize.y * 1.1 };
    var txtSize = 20;

    Renderer.drawRect(ctx, {
      pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
      size: Vector.multiply(Vector.one, txtSize*2),
      corner: 4,
      fill: "gray",
      strokeWidth: 2
    });

    Renderer.drawText(ctx, {
      text: this.keys[ele],
      pos: txtPos,
      size: txtSize,
      color: "#fff"
    });

    i++;
  }

};

},{}],8:[function(require,module,exports){

module.exports = Base.extend({

  pos: { x: 0, y: 0 },

  initialize: function(){},

  update: function(){ },

  draw: function(/*ctx*/){ },

});

},{}],9:[function(require,module,exports){

var Manager = require("./Manager");

var Game = module.exports = function(opts){
  this.cview = opts.viewport;
  this.cworld = opts.world;
  this.cvacuum = opts.vacuum;

  this.viewCtx = null;
  this.worldCtx = null;
  this.vacuumCtx = null;

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

  this.vacuumCtx = this.cvacuum.getContext("2d");
  this.cvacuum.width = config.vacuum.size.x;
  this.cvacuum.height = config.vacuum.size.y;
};

Game.prototype.loop = function(){
  //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
  this.manager.update();
  this.manager.draw(this.viewCtx, this.worldCtx, this.vacuumCtx);
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

},{"./Manager":12}],10:[function(require,module,exports){
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
},{}],11:[function(require,module,exports){

module.exports = Entity.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 1,
  color: Color.white,
  
  initialize: function(){},

  update: function(){ },

  draw: function(ctx){

    Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.to,
      size: this.size,
      color: Color.toRGBA(this.color)
    });

  },

});


},{}],12:[function(require,module,exports){

var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Cursor = require("./Cursor");
var Spiders = require("./Spiders");
var Target = require("./Target");
var Vacuum = require("./Vacuum");
var Stats = require("./Stats");
var Elements = require("./Elements");

var Manager = module.exports = function(){

  this.cursor = new Cursor();
  this.nodes = new Nodes();
  this.paths = new Paths();
  this.target = new Target();
  this.vacuum = new Vacuum(this.target);
  this.elements = new Elements();
  this.spiders = new Spiders(this.nodes);
  this.stats = new Stats();

  this.target.setNodesInside(this.nodes.GetNodes());
};

Manager.prototype.update = function(){
  
  this.cursor.update();

  window.blowing = this.cursor.blowing;
  this.elements.current = this.cursor.element;
  this.elements.active = this.cursor.active;

  if (this.cursor.active){
    this.nodes.applyPos = this.cursor.pos;
    this.nodes.applyRatio = this.cursor.radius;
    this.nodes.element = this.cursor.element;
  }
  else {
    this.nodes.applyPos = null;
  }

  this.nodes.update();
  this.spiders.update();
  this.target.update(this.spiders.spiders);
  this.vacuum.update();
  this.stats.update(this.spiders.stats);

  this.elements.update();

  //Particles.update();
};

Manager.prototype.draw = function(viewCtx, worldCtx, vacuumCtx){
  var s = config.size;
  var vs = config.vacuum.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);
  vacuumCtx.clearRect(0, 0, vs.x, vs.y);

  this.cursor.draw(viewCtx);
  this.nodes.draw(worldCtx);
  this.spiders.draw(worldCtx);
  this.target.draw(worldCtx);

  this.vacuum.draw(vacuumCtx);
  this.stats.draw(viewCtx);
  this.elements.draw(viewCtx);

  //Particles.draw(viewCtx);
};
},{"./Cursor":6,"./Elements":7,"./Nodes":15,"./Paths":17,"./Spiders":22,"./Stats":23,"./Target":24,"./Vacuum":26}],13:[function(require,module,exports){

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

},{}],14:[function(require,module,exports){


module.exports = Circle.extend({

  radius: 3,
  color: Color.white,

  nears: null,
  selected: false,

  temp: 0,
  incTemp: 0,
  incTempSize: 0,

  burned: false,
  shaked: false,
  originalPos: null,
  hasEarth: false,

  insideTarget: false,
  blowing: false,
  blowingEnd: 0,

  initialize: function(){
    this.id = _.guid("nodes"); //TODO: remove this id and change by BaseId (cid)
    this.nears = [];
  },

  addNear: function(node){
    this.nears.push(node);
  },

  randomBurn: function(){
    
    var oneBurned = this.nears.some(function(node){
      return node.burned;
    });

    if (!oneBurned && Mathf.rnd01() < 0.15){
      this.setBurned();
    }
  },

  getNearBurned: function(){
    
    var burned;
    this.nears.some(function(node){
      if (node.burned){
        burned = node;
        return true;
      }
    });

    return burned;
  },

  shake: function(){
    if (this.originalPos){
      this.pos = this.originalPos;
    }
    else {
      this.originalPos = this.pos;
    }
    
    this.shaked = true;
    this.pos = Vector.round(Vector.add(this.pos, Mathf.rndInCircle(0.2)));
  },

  endShake: function(){
    if (this.originalPos){
      this.pos = this.originalPos;
    }
    this.shaked = false;
  },

  revive: function(){
    if (this.burned){
      this.resetTemp();
      this.burned = false;
    }
  },

  burn: function(){
    if (!this.burned){
      this.incTemp = 1;
    }
  },

  cool: function(){
    if (!this.burned){
      this.incTemp = -1;
      this.incTempSize = 0.5;
    }
  },

  applyEarth: function(){
    if (!this.burned){
      this.hasEarth = true;
    }
  },

  applyAir: function(){
    if (!this.burned){
      this.blowing = true;
      this.hasEarth = false;
      this.blowingEnd = Time.time + 500;
    }
  },

  getRandomNear: function(excludeId){
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
  },

  resetTemp: function(){
    this.temp = 0;
    this.incTemp = 0;
    this.incTempSize = 0;
  },

  setBurned: function(){
    this.burned = true;
    this.color = config.nodes.colors.burned;
    this.resetTemp();
  },

  update: function(){

    if (this.burned){
      return;
    }

    if (this.blowing && Time.time > this.blowingEnd){
      this.blowing = false;
    }

    if (this.hasEarth){
      this.color = config.nodes.colors.earth;
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
      if (this.blowing) {    
        this.incTempSize = 0.2; 
      }
      else {
        this.incTempSize = 0.1; 
      }
    }

    if (this.blowing || this.insideTarget) {
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

    if (this.temp > 1){
      this.setBurned();
      this.resetTemp();
      return;
    }

  }

});

},{}],15:[function(require,module,exports){
/*jslint -W083 */

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = Collection.extend({

  paths: null,

  applyPos: null,
  applyRatio: 0,
  element: null,

  initialize: function(){
    this.paths = new Paths();

    var marginW = config.world.margin.x;
    var marginH = config.world.margin.y;
    
    // Full-screen
    var radius = Vector.divide(config.size, 2);

    // Full-screen with margin
    radius.x -= marginW;
    radius.y -= marginH;

    // Center of Screen
    var center = Vector.center(Vector.zero, config.size);

    this.createWeb(center, radius);
  },

  createWeb: function(center, rad){

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
   
    var cNode = new Node({ pos: center });
    this.entities.push(cNode);

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
        var node = new Node({ pos: np });
        
        if (Vector.isOut(np, boundMin, boundMax)) {
          node.out = true;
        }
        else {
          aNodeInside = true;
          this.entities.push(node);
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
    this.entities.forEach(function(node){
      node.randomBurn();
    });

  },

  elements: ["fire", "water", "earth", "air"],
  applyMethods: ["burn", "cool", "applyEarth", "applyAir"],

  findNodeByCollider: function(){
    this.entities.forEach(function (node) {
      if (this.applyPos && Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
        var methodIdx = this.elements.indexOf(this.element);
        var method = this.applyMethods[methodIdx];
        node[method]();
      }
    }, this);
  },

  GetNodes: function(){
    return this.entities;
  },

  update: function(){

    if (this.applyPos){
      this.findNodeByCollider();
    }

    this.paths.update();
    Nodes._super.update.apply(this);
  },

  draw: function(ctx){
    this.paths.draw(ctx);
    Nodes._super.draw.apply(this, arguments);
  }

});

},{"./Node":14,"./Paths":17}],16:[function(require,module,exports){

var Path = module.exports = Line.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 2,
  color: Color.white,

  tBurn: 0.5,
  burned: false,
  heat: null,

  na: null,
  nb: null,
/*
  initialize: function(){
    //TODO: check Heat Line if it should be created as another line or not.
  },
*/
  setHeat: function(from, to, t){
    this.heat = {
      from: from.pos,
      to: Vector.round(Vector.lerp(from.pos, to.pos, t * 2 > 1 ? 1 : t * 2 ))
    };
  },

  update: function(){
    var na = this.na
      , nb = this.nb
      , naT = na.temp
      , nbT = nb.temp
      , naC = na.color
      , nbC = this.nb.color;

    if (naT > 0){
      this.setHeat(na, nb, naT);
    }
    else if (nbT > 0){
      this.setHeat(nb, na, nbT);
    }

    if (naT > this.tBurn && nbT === 0){
      nb.burn();
    }
    else if (nbT > this.tBurn && naT === 0){
      na.burn();
    }

    if (Color.eql(naC,  nbC)){
      this.color = naC;
    }
    else {
      this.color = Color.lerp(naC, nbC, this.tBurn);
    }

    if (na.burned || nb.burned) {
      this.heat = null;
      this.burned = true;
      this.color = config.nodes.colors.burned;
    }

    this.pos = this.na.pos;
    this.to = this.nb.pos;
  },

  draw: function(ctx){
    Path._super.draw.apply(this, arguments);

    if (this.heat){
      Renderer.drawLine(ctx, {
        from: this.heat.from,
        to: this.heat.to,
        size: 5,
        color: "rgba(255,0,0,0.4)"
      });
    }

  },

});

},{}],17:[function(require,module,exports){

var Path = require("./Path");

module.exports = Collection.extend({

  hasOne: function(naId, nbId){
    return this.entities.some(function(path){
      var pa = path.na.id, pb = path.nb.id;
      return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
    });
  },

  addOne: function(nA, nB){
    if (nB && !this.hasOne(nA.id, nB.id)){
      
      nA.addNear(nB);
      nB.addNear(nA);

      this.entities.push(new Path({
        na: nA, 
        nb: nB
      }));
    }
  }

});

},{"./Path":16}],18:[function(require,module,exports){

var Renderer = {};

function fill(ctx, ps){
  if (ps.hasOwnProperty("fill")){
    ctx.fillStyle = ps.fill;
    ctx.fill();
  }
}

function stroke(ctx, ps){
  if (ps.hasOwnProperty("stroke")){
    ctx.lineWidth = ps.strokeWidth || 1;
    ctx.strokeStyle = ps.stroke;
    ctx.stroke();
  }
}

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

  ctx.lineCap = 'round';

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

  if (ps.hasOwnProperty("angle")){
    ctx.save();

    ctx.translate(x + w/2, y + h/2);
    x = -w/2;
    y = -h/2;
    ctx.rotate(ps.angle);

    draw();

    ctx.restore();
    return;
  }

  draw();
};

Renderer.drawText = function(ctx, ps){
  ctx.font = ps.size + 'pt Arial';
  ctx.textBaseline = ps.baseline || 'middle';
  ctx.fillStyle = ps.color;
  ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
};

function drawRect(ctx, ps){
  ctx.beginPath();
  ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
  fill(ctx, ps);
  stroke(ctx, ps);
}

Renderer.drawRect = function(ctx, ps){
  var x = ps.pos.x
    , y = ps.pos.y
    , w = ps.size.x
    , h = ps.size.y;

  if (!ps.hasOwnProperty("corner")){
    drawRect(ctx, ps);
    return;
  }

  var c = ps.corner;

  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.quadraticCurveTo(x + w, y + h, x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.quadraticCurveTo(x, y, x + c, y);
  ctx.closePath();
  
  fill(ctx, ps);
  stroke(ctx, ps);
};

module.exports = Renderer;

},{}],19:[function(require,module,exports){

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
        this[img] = new window.Image();
        this[img].onload = imageLoaded;
        this[img].onerror = imageFailed;
        this[img].src = resources[img];
      }
      return this;
    },
    
    addResources: function(newResources){
      for(var r in newResources){
        resources[r] = newResources[r];
      }
      return this;
    }
    
  };
  
})();
},{}],20:[function(require,module,exports){

module.exports = {

  world: {
    margin: { x: 150, y: 20 }
  },

  nodes: {
      size: 3
    , colors: {
        cold: [255,255,255,1]
      , burn: [255,0,0,1]
      , burned: [0,0,0,0.2]
      , earth: [190,160,40,1]
    }
  },

  paths: {
    size: 2
  },

  spiders: {
      size: 32
    , quantity: 50
    , color: [115,255,0]
    , speed: 0.05
    , speedAlert: 0.1
    , behaviour: {
        alertTemp: 0
      , tStayA: 3000
      , tStayB: 10000
    }
    , sprites: {
        move: [
          { x: 0, y: 0, w: 32, h: 32 }, 
          { x: 32, y: 0, w: 32, h: 32 }, 
          { x: 64, y: 0, w: 32, h: 32 }, 
          { x: 96, y: 0, w: 32, h: 32 }
        ]
    }
  },

  target: {
      size: 180
    , suckForce: 3
  },

  stats: {
    pos: { x: 1, y: 0 },
    colors: {
      kills: [255,0,0,1],
      alives: [0,255,0,1]
    }
  },

  vacuum: {
    size: { x: 300, y: 500 }
  },

  elements: {
    sprites: {
      fire: { x: 0, y: 0, w: 32, h: 32 }, 
      water: { x: 32, y: 0, w: 32, h: 32 }, 
      earth: { x: 64, y: 0, w: 32, h: 32 }, 
      air: { x: 96, y: 0, w: 32, h: 32 }
    }
  },

  images: {  
      "spider": "images/spider.png"
    , "elements": "images/elements.png"
  }

};

},{}],21:[function(require,module,exports){

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
  this.spriteIndex = 0;

  this.animTime = 3;
  this.lastFrameTime = 0;
  this.exited = false;
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

Spider.prototype.animate = function(){

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

Spider.prototype.canMove = function(){
  return !this.staying && !this.traveling && !this.building;
};

Spider.prototype.updateState = function(){
  var cfg = config.spiders
    , tm = Time.time
    , cfgTm = cfg.behaviour
    , tstart = this.t_startStay
    , tstay = this.t_stay;

  if (this.temp > cfgTm.alertTemp){ //alert behaviour!
    this.speed = cfg.speedAlert;
    this.staying = false;
    return;
  }

  // calm behaviour
  this.speed = cfg.speed;

  if (this.staying){
    if(tm > tstart + tstay) {
      this.staying = false;
      this.t_nextStay = tm + tstay / Mathf.rnd(2, 5);
    }
  }
  else if (tm > this.t_nextStay && Mathf.rnd01() < 0.8){
    this.staying = true;
    this.t_startStay = tm;
    this.t_stay = Mathf.rnd(cfgTm.tStayA, cfgTm.tStayB);
  }

};

// returns true if the travel is ended
Spider.prototype.updateMove = function(){

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

  this.pos = Vector.round(Vector.lerp(this.nFrom.pos, this.nTo.pos, fracJourney));

  this.animate();
  this.spPos = Vector.origin(this.pos, this.spSize);
};

Spider.prototype.buildWeb = function(from, to){
  this.building = true;
  this.traveling = true;
  this.setNode(from, to);
};

Spider.prototype.update = function(){
  this.spPos = Vector.origin(this.pos, this.spSize);

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

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: this.spPos,
    size: this.spSize,
    angle: this.angle,
    sp: config.spiders.sprites.move[this.spriteIndex]
  });  
};

},{}],22:[function(require,module,exports){

var Spider = require("./Spider");

var Spiders = module.exports = function(nodes, onExitSpider){
  this.nodes = nodes;
  this.onExitSpider = onExitSpider;

  this.amount = config.spiders.quantity;

  this.spiders = [];

  this.spidersExit = 0;
  this.spidersKilled = 0;

  this.generateSpiders();

  this.stats = {};
  this.updateGUI();
};

Spiders.prototype.updateGUI = function(){
  this.stats = {
    saved: this.spidersExit,
    killed: this.spidersKilled,
    alives: this.spiders.length - (this.spidersKilled + this.spidersExit),
    total: this.spiders.length
  };
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

    if (!node.burned && nodesIds.indexOf(node.id) === -1){
      nodesIds.push(node.id);
      this.spiders.push(new Spider(node.pos, this.onSpiderDead.bind(this)));
      amount--;
    }
  } while(amount);
};

Spiders.prototype.update = function(){

  function gonnaBuildWeb(node, spider){
    if (!node.hasEarth && node.temp === 0 && Mathf.rnd01() > 0.7) {
      var nearBurned = node.getNearBurned();
      if (nearBurned){
        spider.buildWeb(node, nearBurned);
        return true;
      }
    }

    return false;
  }

  function gotNearNodeToGo(node, spider){
    var fromId = (spider.nodeFrom && spider.nodeFrom.id) || -1;
    var nodeTo = node.getRandomNear(fromId);
    if (nodeTo){
      spider.setNode(node, nodeTo);
      return true;
    }

    return false;
  }

  function spiderNodeCollide(spider, node){
    if (Vector.pointInCircle(spider.pos, node.pos, 5)) {
     
      if (!gonnaBuildWeb(node, spider) && !gotNearNodeToGo(node, spider)){
        if (node.burned){
          spider.setDead();
        }
      }
    }
  }

  var nodes = this.nodes.GetNodes();

  var lastExits = this.spidersExit;
  this.spidersExit = 0;
  this.spiders.forEach(function (spider) {

    if (spider.exited){
      this.spidersExit++;
    }
    else if (spider.canMove()){
      nodes.some(function (node) {
        spiderNodeCollide(spider, node);
      }, this);
    }
  
    spider.update();

  }, this);

  if (lastExits !== this.spidersExit){
    this.updateGUI();
  }
};

Spiders.prototype.draw = function(ctx){
  this.spiders.forEach(function (spider) {
    if (!spider.inVacuum){
      spider.draw(ctx);
    }
  });
};
},{"./Spider":21}],23:[function(require,module,exports){

var Stats = module.exports = function(){
  
  this.size = 40;

  var marginW = 15;
  var marginH = 25;

  this.pos = Vector.prod(config.stats.pos, config.size);

  this.kPos = Vector.clone(this.pos);
  this.kPos.x -= marginW + this.size/2;
  this.kPos.y += marginH + this.size;

  this.aPos = Vector.clone(this.pos);
  this.aPos.x -= marginW + this.size/2;
  this.aPos.y += marginH*3 + this.size;
  
  this.kcolor = Color.toRGBA(config.stats.colors.kills);
  this.acolor = Color.toRGBA(config.stats.colors.alives);

  this.stats = {
    saved: 0,
    killed: 0,
    alives: 0,
    total: 0
  };

  this.spSize = Vector.multiply(Vector.one, this.size);
  this.angle = Math.PI / 2;

  this.oAPos = Vector.origin(this.aPos, this.spSize);
  this.oKPos = Vector.origin(this.kPos, this.spSize);
  this.txtSize = 30;
};

Stats.prototype.update = function(stats){
  this.stats = stats;
};

Stats.prototype.draw = function(ctx){
  this.drawIcons(ctx);
  this.drawStats(ctx);
};

Stats.prototype.drawIcons = function(ctx){
  var spSize = this.spSize;
  var kPos = this.oKPos;
  var aPos = this.oAPos;

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: aPos,
    size: spSize,
    angle: this.angle,
    sp: config.spiders.sprites.move[0]
  });

  Renderer.drawSprite(ctx, {
    resource: "spider",
    pos: kPos,
    size: spSize,
    angle: this.angle,
    sp: config.spiders.sprites.move[0]
  });

  Renderer.drawLine(ctx, {
    from: kPos,
    to: Vector.add(spSize, kPos),
    size: 2,
    color: this.kcolor
  });

  Renderer.drawLine(ctx, {
    from: { x: kPos.x + spSize.x, y: kPos.y },
    to: { x: kPos.x, y: kPos.y + spSize.y },
    size: 2,
    color: this.kcolor
  });

};

Stats.prototype.drawStats = function(ctx){
  var txtSize = this.txtSize;

  Renderer.drawText(ctx, {
    text: _.pad(this.stats.alives, 3),
    pos: { x: this.aPos.x - txtSize*3, y: this.aPos.y },
    size: txtSize,
    color: this.acolor
  });

  Renderer.drawText(ctx, {
    text: _.pad(this.stats.killed, 3),
    pos: { x: this.kPos.x - txtSize*3, y: this.kPos.y},
    size: txtSize,
    color: this.kcolor
  });

};
},{}],24:[function(require,module,exports){

var Target = module.exports = function(){

  this.size = config.size.y/6; // config.target.size;
  this.suckForce = config.target.suckForce;

  var marginW = config.world.margin.x;
  var marginH = config.world.margin.y;

  this.pos = Vector.prod(Vector.one, config.size);
  this.pos.x -= marginW + 10;
  this.pos.y -= marginH + 20;
  
  this.saved = [];
  this.saving = [];
};

Target.prototype.setNodesInside = function(nodes){
  nodes.forEach(function(node){
    if (Vector.pointInCircle(node.pos, this.pos, this.size)){
      if (node.burned){
        node.burned = false;
        node.revive();
      }
      node.insideTarget = true;
    }
  }, this);
};

Target.prototype.update = function(spiders){

  spiders.forEach(function(spider){
    if (!spider.dead && !spider.exited){

      if (Vector.pointInCircle(spider.pos, this.pos, this.size)){
        spider.building = false;
        spider.exited = true;
        spider.vel = { x: 0, y: 0 };
        this.saving.push(spider);
      }
    }
  }, this);

  var dt = Time.deltaTime
    , force = dt * this.suckForce
    , p = this.pos;

  this.saving.forEach(function(spider){

    if (!spider.catched){
      var sp = spider.pos;
      var imp = Vector.normal(sp, p);
      spider.vel = Vector.add(spider.vel, Vector.multiply(imp, force)); 
      spider.pos = Vector.add(sp, spider.vel);
      
      if (Vector.pointInCircle(spider.pos, p, 5)){
        spider.catched = true;
        this.saved.push(spider);
      }
    }

  }, this); 

};

Target.prototype.draw = function(ctx){
 
  var startAngle = 0.97 * Math.PI;
  var endAngle = 1.52 * Math.PI;

  ctx.beginPath();
  ctx.lineCap = 'butt';
  ctx.arc(this.pos.x, this.pos.y, this.size/2, startAngle, endAngle, false);
  ctx.lineWidth = this.size;
  ctx.strokeStyle = "rgba(80,255,85,0.1)";
  ctx.stroke();

};
},{}],25:[function(require,module,exports){

var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0,
    spiders: 0,
    emitters: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};

Utils.prototype.pad = function(num, size) {
  var s = "0000000" + num;
  return s.substr(s.length-size);
};

},{}],26:[function(require,module,exports){

var Vacuum = module.exports = function(target){
  this.target = target;
  this.size = config.vacuum.size;

  // Text
  this.txtColor = "#fff";
  this.txtSize = 20;
  this.txtPos = { x: 180, y: 30 };

  this.targetLen = 20;
  this.current = 0;

  this.offx = 30;
  this.offy = 10;

  this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
  this.recipeSize = { x: 80, y: 300 };
};

Vacuum.prototype.update = function(){
  this.current = this.target.saved.length;

  var p = this.recipePos
    , s = this.recipeSize
    , centerY = p.y + (s.y/2)
    , centerX = p.x + (s.x/2)
    , sinTime = Time.time * 2 * Math.PI;

  this.target.saved.forEach(function(spider){

    if (!spider.inVacuum){
      spider.inVacuum = true;
      
      spider.vacuum = {
        ampY: Mathf.rnd(10, centerY/2),
        velY: Mathf.rnd(600, 1000),
        ampX: Mathf.rnd(5, 20),
        velX: Mathf.rnd(2000, 6000),
        rot: Mathf.rnd(1, 5)/10
      };

      spider.pos = { 
        x: centerX,
        y: centerY
      };
    }
    else {
      spider.animate();

      var v = spider.vacuum;

      spider.pos = {
        x: v.ampX * Math.sin(sinTime / v.velX) + centerX,
        y: v.ampY * Math.sin(sinTime / v.velY) + centerY
      };

      spider.angle += v.rot;
    }

  }, this);
  
};

Vacuum.prototype.draw = function(ctx){
  this.drawBG(ctx);
  this.drawContent(ctx);
  this.drawStats(ctx);
};

Vacuum.prototype.drawContent = function(ctx){

  var cPos = this.recipePos;
  var recSize = this.recipeSize;

  Renderer.drawRect(ctx, {
    pos: cPos,
    size: recSize,
    corner: 6,
    fill: "#ffffff",
    strokeWidth: 2
  });

  this.drawSpiders(ctx);

  Renderer.drawRect(ctx, {
    pos: cPos,
    size: recSize,
    corner: 6,
    stroke: "#bbbbf9",
    fill: "rgba(0,0,255,0.5)",
    strokeWidth: 2
  });
};

Vacuum.prototype.drawSpiders = function(ctx){
  this.target.saved.forEach(function(spider){
    spider.draw(ctx);
  });
};

Vacuum.prototype.drawStats = function(ctx){
  var txtSize = this.txtSize;

  Renderer.drawText(ctx, {
    text: _.pad(this.current, 3) + " / " + _.pad(this.targetLen, 3),
    pos: this.txtPos,
    size: txtSize,
    color: this.txtColor
  });

};

Vacuum.prototype.drawBG = function(ctx){
  
  var offx = this.offx
    , offy = this.offy
    , tube = [ [70,460], [120,400], [160,445], [195,450, 185,380], [225,380], [230,510, 145,475] ];

  function drawPath(path, fill, stroke){
    ctx.beginPath();

    var first = path[0];
    ctx.moveTo(offx + first[0], offy + first[1]);

    for (var i=1; i<path.length; i++){
      var p = path[i];
      if (p.length === 4){
        ctx.quadraticCurveTo(offx + p[0], offy + p[1], offx + p[2], offy + p[3]);
      }
      else {
        ctx.lineTo(offx + p[0], offy + p[1]);
      }
    }

    ctx.lineTo(offx + first[0], offy + first[1]);

    if (fill){
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.lineWidth = 3;
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.closePath();
  }

  drawPath(tube, '#9e9e9e', '#474747');

  var cPos = { x: offx + 150, y: offy + 50 };
  Renderer.drawRect(ctx, {
    pos: cPos,
    size: { x: 110, y: 330 },
    corner: 6,
    fill: "#9e9e9e",
    stroke: "#474747",
    strokeWidth: 2
  });

};
},{}],27:[function(require,module,exports){

var Vector = {};

Vector.zero = { x: 0, y: 0 };
Vector.one = { x: 1, y: 1 };

Vector.clone = function(v){
  return { x: v.x, y: v.y };
};

Vector.prod = function(a, b){
  return { x: a.x * b.x, y: a.y * b.y };
};

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

Vector.normal = function(from, to){
  var d = Vector.dif(from, to);
  var l = Vector.length(from, to);

  return {
      x: d.x / l || 0
    , y: d.y / l || 0
  };
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
/*
Vector.circleCollide = function(c1, c2){
  var dx = c1.x - c2.x
    , dy = c1.y - c2.y
    , dist = c1.r + c2.r;
 
  return (dx * dx + dy * dy <= dist * dist);
};
*/
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

},{}],28:[function(require,module,exports){
var w = window;
var doc = w.document;

w.DEBUG = true;

require("./reqAnimFrame");

w.Base = require("./Base");

w.Mathf = require("./Mathf");
w.Color = require("./Color");
w.Vector = require("./Vector");
w.Renderer = require("./Renderer");
w.Repo = require("./Repo");

w.Entity = require("./Entity");
w.Collection = require("./Collection");

w.Circle = require("./Circle");
w.Line = require("./Line");

var Game = require("./Game");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");
//var Particles = require("./Particles");

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
    x: getSize("Width"),
    y: getSize("Height")
  };

  w.config = cfg;
}

function initGame(){
  var cviewport = doc.getElementById("game-viewport");
  var cworld = doc.getElementById("game-world");
  var cvacuum = doc.getElementById("vacuum");

  w._ = new Utils();  
  w.Time = new GameTime();

  //w.Particles = new Particles();

  w.Controls = new Controls({
    container: cviewport
  });

  w.game = new Game({
    viewport: cviewport,
    world: cworld,
    vacuum: cvacuum
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
    .on('complete', function(){
      initGame();
      w.game.start();
    })
    .load();
}

w.onload = onDocLoad;

},{"./Base":1,"./Circle":2,"./Collection":3,"./Color":4,"./Controls":5,"./Entity":8,"./Game":9,"./GameTime":10,"./Line":11,"./Mathf":13,"./Renderer":18,"./Repo":19,"./Settings":20,"./Utils":25,"./Vector":27,"./reqAnimFrame":29}],29:[function(require,module,exports){
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
},{}]},{},[28]);
