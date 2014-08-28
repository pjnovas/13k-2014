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

/*
 * Taken from Backbone and Underscore
 * and only left the minimun and necessary code
 */

var _ = {};
var $ = {};

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

_.pad = function(num, size) {
  var s = "0000000" + num;
  return s.substr(s.length-size);
};


// BASE CLASS 

$.Base = function(attributes) {

  if (_.isObject(attributes)){
    _.extend(this, attributes || {});
  }

  this.cid = _.uniqueId('c');
  
  this.start.apply(this, arguments);
};

_.extend($.Base.prototype, {
  start: function(){},
});

$.Base.extend = function(protoProps, staticProps) {
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


$.Entity = $.Base.extend({

  pos: { x: 0, y: 0 },

  start: function(){},

  update: function(){ },

  draw: function(/*ctx*/){ },

});


$.Collection = $.Base.extend({

  entities: [],

  start: function(){
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


$.Mathf = $.Base.extend({ }, {

  rnd: function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  rnd01: function(){
    return Math.random();
  },

  rndInCircle: function(radius){
    var angle = Math.random() * Math.PI * 2;
    var rad = $.Mathf.rnd(0, radius);

    return {
      x: Math.cos(angle) * rad,
      y: Math.sin(angle) * rad
    };
  },

  lerp: function(a, b, u) {
    return (1 - u) * a + u * b;
  },

  polygonPoints: function(center, radius, sides) {
    var points = [];
    var angle = (Math.PI * 2) / sides;

    for (var i = 0; i < sides; i++) {
      points.push({
        x: center.x + radius * Math.cos(i * angle),
        y: center.y + radius * Math.sin(i * angle)
      });
    }

    return points;
  },

});



$.Color = $.Base.extend({ }, {

  white: [255,255,255,1],

  toRGBA: function(arr){
    return "rgba(" + arr[0] + "," + arr[1] + "," + arr[2] + "," + (arr[3] || 1) + ")";
  },

  lerp: function(from, to, t){

    function l(a, b, t, m){
      m = m ? m : 1;
      return Math.round($.Mathf.lerp(a, b, t) * m) / m;
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
  },

  eql: function(a, b){
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }

});


$.Vector = $.Base.extend({ }, {

  zero: { x: 0, y: 0 },
  one: { x: 1, y: 1 },

  clone: function(v){
    return { x: v.x, y: v.y };
  },

  prod: function(a, b){
    return { x: a.x * b.x, y: a.y * b.y };
  },

  multiply: function(vector, delta){
    return { x: vector.x * delta, y: vector.y * delta };
  },

  divide: function(vector, delta){
    return { x: vector.x / delta, y: vector.y / delta };
  },

  add: function(a, b){
    return { x: a.x + b.x, y: a.y + b.y };
  },

  dif: function(from, to){
    return { x: to.x - from.x, y: to.y - from.y };
  },

  // get "which" part of a point between 2 (i.e. 4th part)
  part: function(from, to, which){
    return $.Vector.lerp(from, to, which/10);
  },

  angleTo: function(from, to){
    var p = $.Vector.dif(from, to);
    return Math.atan2(p.y, p.x);
  },

  // get mid point between 2
  mid: function(from, to){
    return $.Vector.divide($.Vector.add(from, to), 2);
  },

  eql: function(a, b){
    return (a.x === b.x && a.y === b.y);
  },

  normal: function(from, to){
    var d = $.Vector.dif(from, to);
    var l = $.Vector.magnitude(from, to);

    return {
        x: d.x / l || 0
      , y: d.y / l || 0
    };
  },

  origin: function(pos, size){
    return {
        x: pos.x - size.x/2,
        y: pos.y - size.y/2,
    };
  },

  center: function(pos, size){
    return {
        x: pos.x + size.x/2,
        y: pos.y + size.y/2,
    };
  },

  magnitude: function(a, b){
    var dif = $.Vector.dif(a, b);
    return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
  },

  pointInCircle: function(p, pos, radius){
    return $.Vector.magnitude(p, pos) < radius;
  },
  
  lerp: function(from, to, t){

    return {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t
    };

  },

  round: function(v){
    v.x = Math.round(v.x);
    v.y = Math.round(v.y);
    return v;
  },

  isOut: function(p, min, max){
    return (p.x < min.x || p.x > max.x || p.y < min.y || p.y > max.y);
  }

});


$.Renderer = $.Base.extend({ }, {

  fill: function(ctx, ps){
    if (ps.hasOwnProperty("fill")){
      ctx.fillStyle = ps.fill;
      ctx.fill();
    }
  },

  stroke: function(ctx, ps){
    if (ps.hasOwnProperty("stroke")){
      ctx.lineWidth = ps.strokeWidth || ps.stroke.size || 1;

      var strokeColor = ps.stroke.color || ps.stroke || "#000";
      ctx.strokeStyle = Array.isArray(strokeColor) ? $.Color.toRGBA(strokeColor) : strokeColor;
      ctx.stroke();
    }
  },

  _drawRect: function(ctx, ps){
    ctx.beginPath();
    ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  drawCircle: function(ctx, ps){
    var start = (ps.angles && ps.angles.start) || 0,
      end = (ps.angles && ps.angles.end) || 2 * Math.PI;

    ctx.beginPath();

    if (ps.lineCap){
      ctx.lineCap = ps.lineCap;
    }

    ctx.arc(ps.pos.x, ps.pos.y, ps.radius, start, end, false);

    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  drawLine: function(ctx, ps){
    var a = ps.from
      , b = ps.to;

    ctx.beginPath();

    ctx.lineCap = 'round';

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.lineWidth = ps.size;
    ctx.strokeStyle = ps.color;
    ctx.stroke();
  },

  drawSprite: function(ctx, ps){
    var img = $.Repo[ps.resource]
      , p = $.Vector.origin(ps.pos, ps.size)
      , x = p.x
      , y = p.y
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
  },

  drawText: function(ctx, ps){
    ctx.font = ps.size + 'pt Arial';
    ctx.textBaseline = ps.baseline || 'middle';
    ctx.fillStyle = ps.color;
    ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
  },

  drawRect: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , w = ps.size.x
      , h = ps.size.y;

    if (!ps.hasOwnProperty("corner")){
      $.Renderer._drawRect(ctx, ps);
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
    
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  }

});


$.Repo = (function(){
  var resources = {}
    , loaded = 0
    , getCount = function(){
        return Object.keys(resources).length;
      }
    , complete = function(){};

  var imageLoaded = function() {
    var current = getCount();
    var prg = (++loaded * 100) / current;

    if (loaded <= current && prg >= 100){
      complete();
    }
  };
  
  return {
    onComplete: function(callback){
      complete = callback;
      return this;
    },
    
    load: function(){
      loaded = 0;
      for (var img in resources) {
        this[img] = new window.Image();
        this[img].onload = imageLoaded;
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

$.Circle = $.Entity.extend({

  pos: { x: 0, y: 0 },
  radius: 5,
  stroke: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      pos: this.pos,
      radius: this.radius,
      lineCap: this.lineCap || 'butt'
    };

    if (this.color){
      opts.fill = $.Color.toRGBA(this.color);
    }

    if (this.stroke){
      opts.stroke = this.stroke;
    }

    if (this.angles){
      opts.angles = this.angles;
    }

    $.Renderer.drawCircle(ctx, opts);
  },

});


$.Line = $.Entity.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 1,
  color: $.Color.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    $.Renderer.drawLine(ctx, {
      from: this.pos,
      to: this.to,
      size: this.size,
      color: $.Color.toRGBA(this.color)
    });

  },

});



$.Rect = $.Entity.extend({

  pos: { x: 0, y: 0 },
  size: { x: 20, y: 20},
  fill: null,
  stroke: null,
  corner: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    var opts = {
      pos: this.pos,
      size: this.size,
    };

    if (this.stroke){
      opts.stroke = this.stroke;
      if (opts.stroke.color) {
        opts.stroke.color = $.Color.toRGBA(opts.stroke.color);
      }
    }

    if (this.fill){
      opts.fill = $.Color.toRGBA(this.fill);
    }

    if (this.corner){
      opts.corner = this.corner;
    }

    $.Renderer.drawRect(ctx, opts);

  },

});


$.Text = $.Entity.extend({

  pos: { x: 0, y: 0 },
  text: "",

  size: 1,
  color: $.Color.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){

    $.Renderer.drawText(ctx, {
      text: this.text,
      pos: this.pos,
      size: this.size,
      color: $.Color.toRGBA(this.color)
    });

  },

});



$.Sprite = $.Entity.extend({

  resource: "",
  pos: { x: 0, y: 0 },
  sprite: { x: 0, y: 0, w: 20, h: 20 },
  size: { x: 20, y: 20 },
  angle: 0,

  start: function(){},

  update: function(){ },

  draw: function(ctx){

    $.Renderer.drawSprite(ctx, {
      resource: this.resource,
      pos: this.pos,
      size: this.size,
      angle: this.angle,
      sp: this.sprite
    });

  },

});


$.Controls = $.Base.extend({

  events: {
      "pressing": null
    , "moving": null
    , "release": null
    , "element": null
    , "pause": null
  },

  enabled: false,

  start: function(options){
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

    var pos = this.getCoordsEvent(e, this.container);

    this.events[type].forEach(function(cb){
      cb(pos);
    });
  },

  getCoordsEvent: function(e, ele){
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
    
    x -= ele.offsetLeft;
    y -= ele.offsetTop;
    
    return { x: x, y: y };
  }

});


$.Node = $.Circle.extend({

  radius: 3,
  color: $.Color.white,

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

  colors: {
      cold: [255,255,255,1]
    , burn: [255,0,0,1]
    , burned: [0,0,0,0.2]
    , earth: [190,160,40,1]
  },

  start: function(){
    this.nears = [];
  },

  addNear: function(node){
    this.nears.push(node);
  },

  randomBurn: function(){
    
    var oneBurned = this.nears.some(function(node){
      return node.burned;
    });

    if (!oneBurned && $.Mathf.rnd01() < 0.15){
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
    this.pos = $.Vector.round($.Vector.add(this.pos, $.Mathf.rndInCircle(0.2)));
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
      if (n.cid !== excludeId && !n.burned && n.temp < 0.5){
        ns.push(n);
      }
    });

    if (ns.length > 0){
      var idx = $.Mathf.rnd(0, ns.length-1);
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
    this.fill = this.color = this.colors.burned;
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
      this.fill = this.color = this.colors.earth;
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

    this.fill = this.color = $.Color.lerp(this.colors.cold, this.colors.burn, this.temp);

    if (this.temp > 1){
      this.setBurned();
      this.resetTemp();
      return;
    }

  }

});

/*jslint -W083 */

$.Nodes = $.Collection.extend({

  paths: null,

  applyPos: null,
  applyRatio: 0,
  element: null,

  start: function(){
    this.paths = new $.Paths();

    var marginW = config.world.margin.x;
    var marginH = config.world.margin.y;
    
    // Full-screen
    var radius = $.Vector.divide(config.size, 2);

    // Full-screen with margin
    radius.x -= marginW;
    radius.y -= marginH;

    // Center of Screen
    var center = $.Vector.center($.Vector.zero, config.size);

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
      , boundMin = $.Vector.add(center, $.Vector.multiply(rad, -1))
      , boundMax = $.Vector.add(center, rad)
      , rings = [];
   
    var cNode = new $.Node({ pos: center });
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

      var ps = $.Mathf.polygonPoints(center, (i*ringsGap) + start, nodesByRing);
      countNodes += ps.length;
      var cRing = [];

      if (i === 10 || i === 20){
        rndRadius += 0.1;
      }

      ps.forEach(function(p){

        var np = $.Vector.round($.Vector.add(p, $.Mathf.rndInCircle(rndRadius)));
        var node = new $.Node({ pos: np });
        
        if ($.Vector.isOut(np, boundMin, boundMax)) {
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
      if (this.applyPos && $.Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
        var methodIdx = this.elements.indexOf(this.element);
        var method = this.applyMethods[methodIdx];
        node[method]();
      }
    }, this);
  },

  getNodes: function(){
    return this.entities;
  },

  update: function(){

    if (this.applyPos){
      this.findNodeByCollider();
    }

    this.paths.update();
    $.Nodes._super.update.apply(this);
  },

  draw: function(ctx){
    this.paths.draw(ctx);
    $.Nodes._super.draw.apply(this, arguments);
  }

});


$.Path = $.Line.extend({

  pos: { x: 0, y: 0 },
  to: { x: 0, y: 0 },

  size: 2,
  color: $.Color.white,

  tBurn: 0.5,
  burned: false,
  heat: null,

  na: null,
  nb: null,
/*
  start: function(){
    //TODO: check Heat Line if it should be created as another line or not.
  },
*/
  setHeat: function(from, to, t){
    this.heat = {
      from: from.pos,
      to: $.Vector.round($.Vector.lerp(from.pos, to.pos, t * 2 > 1 ? 1 : t * 2 ))
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

    if ($.Color.eql(naC,  nbC)){
      this.color = naC;
    }
    else {
      this.color = $.Color.lerp(naC, nbC, this.tBurn);
    }

    if (na.burned || nb.burned) {
      this.heat = null;
      this.burned = true;
      this.color = [0,0,0,0.2];
    }

    this.pos = this.na.pos;
    this.to = this.nb.pos;
  },

  draw: function(ctx){
    $.Path._super.draw.apply(this, arguments);

    if (this.heat){
      $.Renderer.drawLine(ctx, {
        from: this.heat.from,
        to: this.heat.to,
        size: 5,
        color: "rgba(255,0,0,0.4)"
      });
    }

  },

});


$.Paths = $.Collection.extend({

  hasOne: function(naId, nbId){
    return this.entities.some(function(path){
      var pa = path.na.cid, pb = path.nb.cid;
      return (naId === pa || naId === pb) && (nbId === pa || nbId === pb);
    });
  },

  addOne: function(nA, nB){
    if (nB && !this.hasOne(nA.cid, nB.cid)){
      
      nA.addNear(nB);
      nB.addNear(nA);

      this.entities.push(new $.Path({
        na: nA, 
        nb: nB
      }));
    }
  }

});


$.Cursor = $.Circle.extend({

  radius: 20,
  stroke: {
    color: "#fff",
    size: 2
  },

  active: false,
  element: "fire",

  start: function(){
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


$.Spider = $.Sprite.extend({

  resource: "spider",
  size: { x: 32, y: 32 },

  nFrom: null,
  nTo: null,
  journeyLength: null,

  traveling: false,
  isDead: false,

  temp: 0,
  staying: false,

  t_stay: 2000,
  t_startStay: 0,
  t_nextStay: 0,

  t_startMove: 0,

  building: false,

  spriteIndex: 0,

  animTime: 3,
  lastFrameTime: 0,
  exited: false,

  calmSpeed: 0.05,
  alertSpeed: 0.1,

  behaviour: {
      alertTemp: 0
    , tStayA: 3000
    , tStayB: 10000
  },

  start: function(options){
    this.pos = $.Vector.round(options.pos);
    this.onDead = options.onDead;

    this.speed = this.calmSpeed;

    this.move = [];
    for(var i=0;i<4;i++){
      this.move.push({ x: i*32, y: 0, w: 32, h: 32 });
    }

    this.sprite = this.move[0];
  },

  setNode: function(nFrom, nTo){
    this.nFrom = nFrom;
    this.nTo = nTo;

    this.t_startMove = Time.time;
    this.journeyLength = $.Vector.magnitude(nFrom.pos, nTo.pos);
    this.traveling = true;

    this.angle = $.Vector.angleTo(this.pos, this.nTo.pos);
  },

  setDead: function(){
    if (!this.isDead){
      this.isDead = true;
      this.onDead();
    }
  },

  animate: function(){

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

  },

  updateTemp: function(){
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
  },

  canMove: function(){
    return !this.staying && !this.traveling && !this.building;
  },

  updateState: function(){
    var tm = Time.time
      , cfgTm = this.behaviour
      , tstart = this.t_startStay
      , tstay = this.t_stay;

    if (this.temp > cfgTm.alertTemp){ //alert behaviour!
      this.speed = this.alertSpeed;
      this.staying = false;
      return;
    }

    // calm behaviour
    this.speed = this.calmSpeed;

    if (this.staying){
      if(tm > tstart + tstay) {
        this.staying = false;
        this.t_nextStay = tm + tstay / $.Mathf.rnd(2, 5);
      }
    }
    else if (tm > this.t_nextStay && $.Mathf.rnd01() < 0.8){
      this.staying = true;
      this.t_startStay = tm;
      this.t_stay = $.Mathf.rnd(cfgTm.tStayA, cfgTm.tStayB);
    }

  },

  // returns true if the travel is ended
  updateMove: function(){

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

    this.pos = $.Vector.round($.Vector.lerp(this.nFrom.pos, this.nTo.pos, fracJourney));

    this.animate();
  },

  buildWeb: function(from, to){
    this.building = true;
    this.traveling = true;
    this.setNode(from, to);
  },

  update: function(){
    this.sprite = this.move[this.spriteIndex];

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
  },

  draw: function(ctx){
    if (this.isDead){
      return;
    }

    if (this.building){
      $.Renderer.drawLine(ctx, {
        from: this.pos,
        to: this.nFrom.pos,
        size: 2,
        color: $.Color.toRGBA($.Color.white)
      });
    }

    $.Spider._super.draw.apply(this, arguments);
  }

});


$.Spiders = $.Collection.extend({

  nodes: null,
  spidersExit: 0,
  spidersKilled: 0,
  stats: {},
  amount: 50,

  start: function(options){
    this.entities = [];
    this.nodes = options.nodes;

    this.onExitSpider = options.onExitSpider;

    this.generateSpiders();
    this.updateGUI();
  },

  updateGUI: function(){
    this.stats = {
      saved: this.spidersExit,
      killed: this.spidersKilled,
      alives: this.entities.length - (this.spidersKilled + this.spidersExit),
      total: this.entities.length
    };
  },

  onSpiderDead: function(){
    this.spidersKilled++;
    this.updateGUI();
  },

  generateSpiders: function(){
    var nodes = this.nodes.getNodes()
      , len = nodes.length
      , nodesIds = []
      , node
      , idx
      , amount = (len < this.amount ? len-2: this.amount);

    do {
      idx = $.Mathf.rnd(0, len-1);
      node = nodes[idx];

      if (!node.burned && nodesIds.indexOf(node.cid) === -1){
        nodesIds.push(node.cid);
        
        this.entities.push(new $.Spider({
          pos: node.pos, 
          onDead: this.onSpiderDead.bind(this)
        }));

        amount--;
      }
    } while(amount);
  },

  getSpiders: function(){
    return this.entities;
  },

  gonnaBuildWeb: function(node, spider){
    if (!node.hasEarth && node.temp === 0 && $.Mathf.rnd01() > 0.7) {
      var nearBurned = node.getNearBurned();
      if (nearBurned){
        spider.buildWeb(node, nearBurned);
        return true;
      }
    }

    return false;
  },

  gotNearNodeToGo: function(node, spider){
    var fromId = (spider.nodeFrom && spider.nodeFrom.cid) || -1;
    var nodeTo = node.getRandomNear(fromId);
    if (nodeTo){
      spider.setNode(node, nodeTo);
      return true;
    }

    return false;
  },

  spiderNodeCollide: function(spider, node){
    if ($.Vector.pointInCircle(spider.pos, node.pos, 5)) {
     
      if (!this.gonnaBuildWeb(node, spider) && !this.gotNearNodeToGo(node, spider)){
        if (node.burned){
          spider.setDead();
        }
      }
    }
  },

  update: function(){
    
    var nodes = this.nodes.getNodes();

    var lastExits = this.spidersExit;
    this.spidersExit = 0;
    this.entities.forEach(function (spider) {

      if (spider.exited){
        this.spidersExit++;
      }
      else if (spider.canMove()){
        nodes.some(function (node) {
          this.spiderNodeCollide(spider, node);
        }, this);
      }
    
      spider.update();

    }, this);

    if (lastExits !== this.spidersExit){
      this.updateGUI();
    }
  },

  draw: function(ctx){
    this.entities.forEach(function (spider) {
      if (!spider.inVacuum){
        spider.draw(ctx);
      }
    });
  }

});


$.Target = $.Circle.extend({

  stroke: {
    color: [80,255,85,0.1]
  },
  angles: {
    start: 0.97 * Math.PI,
    end: 1.52 * Math.PI
  },
  lineCap: 'butt',
  
  suckForce: 3,

  start: function(){
    var cfg = config
      , cfgm = cfg.world.margin;

    this.size = cfg.size.y/6;
    this.radius = this.size/2;
    this.stroke.size = this.size;

    this.pos = $.Vector.prod($.Vector.one, cfg.size);
    this.pos.x -= cfgm.x + 10;
    this.pos.y -= cfgm.y + 20;
    
    this.saved = [];
    this.saving = [];
  },

  setNodesInside: function(nodes){
    nodes.forEach(function(node){
      if ($.Vector.pointInCircle(node.pos, this.pos, this.size)){
        if (node.burned){
          node.burned = false;
          node.revive();
        }
        node.insideTarget = true;
      }
    }, this);
  },

  update: function(spiders){

    spiders.forEach(function(spider){
      if (!spider.dead && !spider.exited){

        if ($.Vector.pointInCircle(spider.pos, this.pos, this.size)){
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
        var imp = $.Vector.normal(sp, p);
        spider.vel = $.Vector.add(spider.vel, $.Vector.multiply(imp, force)); 
        spider.pos = $.Vector.add(sp, spider.vel);
        
        if ($.Vector.pointInCircle(spider.pos, p, 5)){
          spider.catched = true;
          this.saved.push(spider);
        }
      }

    }, this); 

  }

});


$.Vacuum = $.Entity.extend({

  start: function(options){
    this.target = options.target;
    this.size = config.vacuum.size;

    this.targetLen = 20;
    this.current = 0;

    this.offx = 30;
    this.offy = 10;

    this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
    this.recipeSize = { x: 80, y: 300 };

    this.createGraphics();
  },

  createGraphics: function(){
    var cPos = { x: this.offx + 150, y: this.offy + 50 };

    this.bgBack = new $.Rect({
      pos: cPos,
      size: { x: 110, y: 330 },
      corner: 6,
      fill: [158,158,158],
      stroke: {
        color: [71,71,71],
        size: 2
      }
    });

    var c = [187,187,249];

    var opts = {
      pos: this.recipePos,
      size: this.recipeSize,
      corner: 6,
      fill: $.Color.white,
      stroke: {
        size: 2,
        color: c
      }
    };

    this.cilinder = new $.Rect(opts);

    opts.fill = [0,0,255,0.5];
    this.glass = new $.Rect(opts);

    this.stats = new $.Text({
      pos: { x: 180, y: 30 },
      size: 20,
      color: $.Color.white
    });

  },

  update: function(){
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
          ampY: $.Mathf.rnd(10, centerY/2),
          velY: $.Mathf.rnd(600, 1000),
          ampX: $.Mathf.rnd(5, 20),
          velX: $.Mathf.rnd(2000, 6000),
          rot: $.Mathf.rnd(1, 5)/10
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
    
    this.stats.text = _.pad(this.current, 3) + " / " + _.pad(this.targetLen, 3);
  },

  draw: function(ctx){
    this.drawBG(ctx);
    
    this.cilinder.draw(ctx);
    
    this.target.saved.forEach(function(spider){
      spider.draw(ctx);
    });

    this.glass.draw(ctx);
    this.stats.draw(ctx);
  },

  drawBG: function(ctx){
    
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
    this.bgBack.draw(ctx);
  }

});


$.Stats = $.Collection.extend({

  pos: { x: 1, y: 0 },

  marginW: 40,
  marginH: 40,

  colors: {
    kills: [255,0,0,1],
    alives: [0,255,0,1]
  },

  start: function(){
    this.entities = [];
    this.pos = $.Vector.prod(this.pos, config.size);

    this.stats = {
      saved: 0,
      killed: 0,
      alives: 0,
      total: 0
    };

    this.createIcons();
    this.createText();
  },

  createIcons: function(){
    var size = 40
      , mW = this.marginW
      , mH = this.marginH
      , spSize = { x: size, y: size }
      , hSpSize = { x: size/2, y: size/2 };

    var spider = {
      resource: "spider",
      sprite: { x: 0, y: 0, w: 32, h: 32 },
      size: spSize,
      angle: Math.PI / 2
    };

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH + size*1.5
    };

    this.iconAlives = new $.Sprite(spider);
    this.entities.push(this.iconAlives);

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH
    };

    this.iconKills = new $.Sprite(spider);
    this.entities.push(this.iconKills);
    
    this.lineAKills = new $.Line({
      pos: $.Vector.origin(spider.pos, spSize),
      to: $.Vector.add(hSpSize, spider.pos),
      size: 3,
      color: this.colors.kills
    });
    this.entities.push(this.lineAKills);

    this.lineBKills = new $.Line({
      pos: { x: spider.pos.x + hSpSize.x, y: spider.pos.y - hSpSize.y },
      to: { x: spider.pos.x - hSpSize.x, y: spider.pos.y + hSpSize.y },
      size: 3,
      color: this.colors.kills
    });
    this.entities.push(this.lineBKills);
  },

  createText: function(){
    var txtSize = 30;

    this.textKills = new $.Text({
      pos: { x: this.iconKills.pos.x - txtSize*3, y: this.iconKills.pos.y },
      size: txtSize,
      color: this.colors.kills
    });
    this.entities.push(this.textKills);

    this.textAlives = new $.Text({
      pos: { x: this.iconAlives.pos.x - txtSize*3, y: this.iconAlives.pos.y },
      size: txtSize,
      color: this.colors.alives
    });
    this.entities.push(this.textAlives);

  },

  update: function(stats){
    this.stats = stats;

    this.textKills.text = _.pad(this.stats.killed, 3);
    this.textAlives.text = _.pad(this.stats.alives, 3);
  },

});


$.Element = $.Collection.extend({

  size: { x: 96, y: 96 },

  start: function(options){
    this.entities = [];

    this.name = options.name;
    this.key = options.key;
    this.color = [255,255,255,1];
    this.sprite = options.sprite;

    this.active = false;
    this.current = false;

    this.createElement();
  },

  createElement: function(){
    
    this.bg = new $.Rect({
      pos: this.pos,
      size: this.size,
      fill: this.color,
      stroke: { size: 4, color: [30,30,30,1] },
      corner: 8
    });
    this.entities.push(this.bg);

    this.icon = new $.Sprite({
      resource: "elements",
      pos: $.Vector.center(this.pos, this.size),
      size: this.size,
      angle: 0,
      sprite: this.sprite
    });
    this.entities.push(this.icon);

    var txtPos = { x: this.pos.x, y: this.pos.y + this.size.y * 1.1 };
    var txtSize = 20;

    this.ctrlKey = new $.Rect({
      pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
      size: $.Vector.multiply($.Vector.one, txtSize*2),
      fill: [0,0,0,1],
      corner: 4
    });
    this.entities.push(this.ctrlKey);

    this.txtKey = new $.Text({
      text: this.key,
      pos: txtPos,
      size: txtSize,
      color: [255,255,255,1]
    });
    this.entities.push(this.txtKey);
  },

  update: function(){
    this.bg.fill = this.active ? [255,255,255,1] : [255,255,255, 0.1];
    this.bg.stroke.color = this.current ? [255,255,255,1] : [0,0,0,1];
  },

});


$.Elements = $.Collection.extend({

  pos: { x: 20, y: 50},

  start: function(){
    this.entities = [];

    this.current = "fire";
    this.active = false;

    this.keys = ["Q", "W", "E", "R"];
    this.elements = ["fire", "water", "earth", "air"];

    this.sprites = {};
    for(var i=0;i<4;i++){
      this.sprites[this.elements[i]] = { x: i*32, y: 0, w: 32, h: 32 };
    }

    this.createElements();
  },

  createElements: function(){
    var gap = 50
      , size = 96;

    this.elements.forEach(function(ele, i){

      this.entities.push(new $.Element({
        pos: { x: this.pos.x, y: this.pos.y + (i * (size + gap)) },
        name: ele,
        key: this.keys[i],
        sprite: this.sprites[ele]
      }));

    }, this);
  },

  update: function(){
    var isActive = this.active
      , current = this.current;

    this.entities.forEach(function(e){
      e.active = e.current = false;
      if (e.name === current){
        e.current = true;
        e.active = isActive;
      }
      
      e.update();
    });
  },

});


$.Manager = $.Base.extend({

  start: function(){
    this.cursor = new $.Cursor();
    this.nodes = new $.Nodes();
    this.paths = new $.Paths();
    this.target = new $.Target();

    this.vacuum = new $.Vacuum({
      target: this.target
    });

    this.elements = new $.Elements();

    this.spiders = new $.Spiders({
      nodes: this.nodes
    });

    this.stats = new $.Stats();

    this.target.setNodesInside(this.nodes.getNodes());
  },

  update: function(){
    var cursor = this.cursor
      , nodes = this.nodes
      , spiders = this.spiders
      , elements = this.elements;

    cursor.update();

    elements.current = cursor.element;
    elements.active = cursor.active;

    nodes.applyPos = null;
    if (cursor.active){
      nodes.applyPos = cursor.pos;
      nodes.applyRatio = cursor.radius;
      nodes.element = cursor.element;
    }

    nodes.update();
    spiders.update();
    this.target.update(spiders.getSpiders());
    this.vacuum.update();
    this.stats.update(spiders.stats);

    elements.update();

    //Particles.update();
  },

  draw: function(viewCtx, worldCtx, vacuumCtx){
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
  }

});


$.GameTime = $.Base.extend({

  lastTime: null,
  frameTime: 0,
  deltaTime: 0,
  typicalFrameTime: 20,
  minFrameTime: 12,
  time: 0,

  start: function(){
    this.lastTime = Date.now();
  },

  tick: function(){
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
  }

});

/*
GameTime.prototype.reset = function() {
  this.lastTime = Date.now();
  this.frameTime = 0;
  this.deltaTime = 0;
  this.typicalFrameTime = 20;
  this.minFrameTime = 12; 
  this.time = 0;
};
*/

$.Game = $.Base.extend({

  viewCtx:  null,
  worldCtx:  null,
  vacuumCtx:  null,

  tLoop:  null,
  paused:  false,

  start: function(options){
    this.cview = options.viewport;
    this.cworld = options.world;
    this.cvacuum = options.vacuum;

    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();

    this.manager = new $.Manager();
  },

  initContexts: function(){
    var size = config.size
      , vsize = config.vacuum.size;

    function getContext(canvas, _size){
      canvas.width = _size.x;
      canvas.height = _size.y;
      return canvas.getContext("2d");
    }

    this.viewCtx = getContext(this.cview, size);
    this.worldCtx = getContext(this.cworld, size);
    this.vacuumCtx = getContext(this.cvacuum, vsize);
  },

  loop: function(){
    //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
    this.manager.update();
    this.manager.draw(this.viewCtx, this.worldCtx, this.vacuumCtx);
  },

  play: function(){
    this.paused = false;
    Controls.enable();
    this.gameRun();
  },

  stop: function(){
    this.paused = true;
    Controls.disable();
    window.cancelAnimationFrame(this.tLoop);
  },

  gameRun: function(){
    if (Time.tick()) { this.loop(); }
    this.tLoop = window.requestAnimationFrame(this.boundGameRun);
  },

  onWin: function(cb){
    this._onWin = cb;
  },

  onLoose: function(cb){
    this._onLoose = cb;
  }

});


(function(){
  var w = window;
  var doc = w.document;
  var modal = document.querySelector(".bg-modal");

  //require("./reqAnimFrame");
  //require("./ng");

  //w.prefabs = require("./prefabs");

  //var Game = require("./Game");
  //var GameTime = require("./GameTime");

  //var Particles = require("./Particles");

  function configGame(){
    var ele = doc.documentElement
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

    var w = getSize("Width");
    var h = getSize("Height");

    var max = { x: 1250, y: 750 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    var gameCtn = doc.getElementById("game-ctn");
    gameCtn.style.width = size.x + "px";
    gameCtn.style.height = size.y + "px";

    return {
      size: size,
      world: {
        margin: { x: 150, y: 20 }
      },
      vacuum: {
        size: { x: 300, y: 500 }
      },
      images: {  
          "spider": "images/spider.png"
        , "elements": "images/elements.png"
      }
    };
  }

  function initGame(){
    var cviewport = doc.getElementById("game-viewport");
    var cworld = doc.getElementById("game-world");
    var cvacuum = doc.getElementById("vacuum");

    w.Time = new $.GameTime();

    //w.Particles = new Particles();

    w.Controls = new $.Controls({
      container: doc.getElementById("game-ctn")
    });

    w.game = new $.Game({
      viewport: cviewport,
      world: cworld,
      vacuum: cvacuum
    });

    function toggleModal(show){
      modal.style.display = show ? "" : "none";
    }

    w.game.onWin(function(){
      modal.innerHTML = '<div class="finish">Win!</div>';
      toggleModal(true);
      game.stop(); 
    });

    w.game.onLoose(function(){
      modal.innerHTML = '<div class="finish">Loose!</div>';
      toggleModal(true);
      game.stop(); 
    });

    function pauseGame(){
      if (game.paused){
        toggleModal();
        game.play();
      }
      else {
        modal.innerHTML = '<div class="pause">Pause</div>';
        toggleModal(true);
        game.stop(); 
      }
    }

    toggleModal();
    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();

    $.Repo.addResources(w.config.images)
      .onComplete(function(){
        initGame();
        w.game.play();
      })
      .load();
  }

  w.onload = onDocLoad;

}());