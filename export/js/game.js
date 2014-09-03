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


$.M = $.Base.extend({ }, {

  rnd: function(min, max){
    return Math.floor(Math.random() * (max - min + 1) + min);
  },

  rnd01: function(){
    return Math.random();
  },

  rnd11: function(){
    return Math.random() > 0.5 ? 1 : -1;
  },

  rndInCircle: function(radius){
    var angle = Math.random() * Math.PI * 2;
    var rad = $.M.rnd(0, radius);

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



$.C = $.Base.extend({ }, {

  white: [255,255,255,1],

  toRGBA: function(arr){
    if (Array.isArray(arr)){
      return "rgba(" + (arr[0] || 0) + "," + (arr[1] || 0) + "," + (arr[2] || 0) + "," + (arr[3] || 1).toFixed(1) + ")";
    }
    return arr;
  },

  lerp: function(from, to, t){

    function l(a, b, t, m){
      m = m ? m : 1;
      return Math.round($.M.lerp(a, b, t) * m) / m;
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


$.V = $.Base.extend({ }, {

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
    return $.V.lerp(from, to, which/10);
  },

  angleTo: function(from, to){
    var p = $.V.dif(from, to);
    return Math.atan2(p.y, p.x);
  },

  // get mid point between 2
  mid: function(from, to){
    return $.V.divide($.V.add(from, to), 2);
  },

  eql: function(a, b){
    return (a.x === b.x && a.y === b.y);
  },

  normal: function(from, to){
    var d = $.V.dif(from, to);
    var l = $.V.magnitude(from, to);

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
    var dif = $.V.dif(a, b);
    return Math.sqrt(dif.x*dif.x + dif.y*dif.y);
  },

  pointInCircle: function(p, pos, radius){
    return $.V.magnitude(p, pos) < radius;
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
    if (ps.fill){
      ctx.fillStyle = $.C.toRGBA(ps.fill);
      ctx.fill();
    }
  },

  stroke: function(ctx, ps){
    if (ps.stroke){
      ctx.lineWidth = ps.stroke.size || 1;
      ctx.strokeStyle = $.C.toRGBA(ps.stroke.color);
      ctx.stroke();
    }
  },

  _rect: function(ctx, ps){
    ctx.beginPath();
    ctx.rect(ps.pos.x, ps.pos.y, ps.size.x, ps.size.y);
    $.Renderer.fill(ctx, ps);
    $.Renderer.stroke(ctx, ps);
  },

  circle: function(ctx, ps){
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

  line: function(ctx, ps){
    var a = ps.pos
      , b = ps.to;

    ctx.beginPath();

    ctx.lineCap = 'round';

    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);

    ctx.lineWidth = ps.size;
    ctx.strokeStyle = $.C.toRGBA(ps.color);
    ctx.stroke();
  },

  sprite: function(ctx, ps){
    var img = $.repo[ps.resource]
      , p = $.V.origin(ps.pos, ps.size)
      , x = p.x
      , y = p.y
      , w = ps.size.x
      , h = ps.size.y
      , sp = ps.sprite;

    function draw(){
      if (sp){
        ctx.drawImage(img, sp.x, sp.y, sp.w, sp.h, x, y, w, h);
      }
      else {
        ctx.drawImage(img, x, y, w, h);
      }
    }

    if (!isNaN(ps.angle)){
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

  text: function(ctx, ps){
    ctx.font = ps.size + 'pt Arial';
    ctx.textBaseline = ps.baseline || 'middle';
    ctx.fillStyle = $.C.toRGBA(ps.color);

    ctx.fillText(ps.text, ps.pos.x, ps.pos.y);
  },

  rect: function(ctx, ps){
    var x = ps.pos.x
      , y = ps.pos.y
      , w = ps.size.x
      , h = ps.size.y;

    if (!ps.corner){
      $.Renderer.rect(ctx, ps);
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


$.Circle = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //radius: 5,
  //fill:null,
  //stroke: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.circle(ctx, this);
  },

});


$.Line = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //to: { x: 0, y: 0 },

  //size: 1,
  //color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.line(ctx, this);
  },

});



$.Rect = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //size: { x: 20, y: 20},
  //fill: null,
  //stroke: null,
  //corner: null,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.rect(ctx, this);
  },

});


$.Text = $.Entity.extend({

  //pos: { x: 0, y: 0 },
  //text: "",

  //size: 1,
  color: $.C.white,
  
  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.text(ctx, this);
  },

});



$.Sprite = $.Entity.extend({

  //resource: "",
  //pos: { x: 0, y: 0 },
  //sprite: { x: 0, y: 0, w: 20, h: 20 },
  //size: { x: 20, y: 20 },
  //angle: 0,

  start: function(){},

  update: function(){ },

  draw: function(ctx){
    $.Renderer.sprite(ctx, this);
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
    doc.addEventListener("keyup", this._onKeyUp.bind(this));
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



$.Particles = $.Collection.extend({

  max: 250, //max particles in world

  start: function(){
    this.entities = [];
    this.emitters = {};

    this.init(this.max);
  },

  init: function(max){
    for (var i=0; i<max; i++){
      this.entities.push({
        active: false
      });
    }  
  },

  createEmitter: function(emitter, ops){
    var e = this.emitters[emitter.cid] = {
      emitter: emitter,
      options: ops,
      count: 0,
      lastr: 0,
      active: (ops.auto ? true : false)
    };

    return e;
  },

  toggleEmiter: function(eid, active){
    var e = this.emitters[eid];
    if (e) {
      e.active = active;
    }
  },

  playEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, true);
  },

  stopEmiter: function(emitter){
    this.toggleEmiter(emitter.cid, false);
  },

  createEmitterParticles: function(cid, howMany){
    for (var i=0; i<howMany; i++){
      var e = this.emitters[cid];
      if (!this.initParticle(e.emitter, e.options)){
        return;
      }
    }
  },

  runEmitters: function(){
    for (var cid in this.emitters){
      var e = this.emitters[cid];
      e.lastr -= $.dt;

      if (e.active && e.count < e.options.max && e.lastr <= 0){
        e.lastr = e.options.rate;
        var am = e.options.ratep;
        this.createEmitterParticles(cid, am);
        e.count += am;
      }
    }
  },

  initParticle: function(emitter, opts){
    var p = this.getParticle();
    
    if (p){

      p.active = true;

      p.g = opts.g || $.V.zero;
      p.d = opts.d || $.V.one;
      p.f = opts.f || $.V.one;

      p.pos = emitter.pos;

      if (opts.rad) {

        var rX = $.M.rnd(0, opts.rad) * $.M.rnd11();
        var rY = $.M.rnd(0, opts.rad) * $.M.rnd11();
        
        p.pos = { x: emitter.pos.x+rX, y: emitter.pos.y+rY };
      }

      p.cFrom = opts.cFrom;
      p.cTo = opts.cTo;

      p.life = opts.life;
      p.tlife = opts.life;
      p.size = opts.size || 1;

      p.emitter = emitter;
      
      return true;
    }

    return false;
  },

  getParticle: function(){
    var ps = this.entities
      , len = ps.length;

    for(var i = 0; i< len; i++){
      if (!ps[i].active){
        return ps[i];
      }
    }

    return null;
  },

  updateParticle: function(p){
    p.f = $.V.multiply(p.g, $.dt);
    p.d = $.V.add(p.d, p.f);
    p.pos = $.V.add(p.pos, $.V.multiply(p.d, $.dt));

    if (p.cFrom && p.cTo) {
      p.color = $.C.lerp(p.cFrom, p.cTo, 1 - ((p.life*100) / p.tlife)/100);
    }

    p.life -= $.dt;
  },

  drawParticle: function(ctx, p){

    $.Renderer.circle(ctx, {
      pos: p.pos,
      radius: p.size,
      fill: p.color
    });

  },

  update: function(){
    this.runEmitters();

    this.entities.forEach(function(p){
      if (p.life <= 0){
        p.active = false;
      }

      if (p.active){
        this.updateParticle(p);
      }
      else if (p.emitter) {
        var e = this.emitters[p.emitter.cid];
        if (e && e.active) {
          e.count--;
        }
      }
    }, this);
  },

  draw: function(ctx){
    this.entities.forEach(function(p){
      if (p.active){
        this.drawParticle(ctx, p);
      }
    }, this);
  }


});


$.Node = $.Circle.extend({

  radius: 3,
  fill: $.C.white,

  nears: null,

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
      cold: [200,200,200,1]
    , burn: [255,0,0,1]
    , burned: [,,,0.2]
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

    if (!oneBurned && $.M.rnd01() < 0.15){
      this.setBurned(true);
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
    this.pos = $.V.round($.V.add(this.pos, $.M.rndInCircle(0.2)));
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

  dirty: function(){
    if (!this.burned){
      this.hasEarth = true;
    }
  },

  blow: function(){
    if (!this.burned){
      this.blowing = true;

      if (this.hasEarth){
        Particles.createEmitter(this, {
          auto: true,
          max: 20,
          rate: 0.2,
          ratep: 10,
          life: 1,
          rad: 10,
          size: 10,
          cFrom: [165,140,80,0.8],
          cTo: [10,10,10,0.1],
          g: { x: 0, y: -100}
        });

        var self = this;
        window.setTimeout(function(){
          Particles.stopEmiter(self);
        }, 1000);
      }

      this.hasEarth = false;
      this.blowingEnd = $.tm + 500;
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
      var idx = $.M.rnd(0, ns.length-1);
      return ns[idx];
    }

    return null;
  },

  resetTemp: function(){
    this.temp = 0;
    this.incTemp = 0;
    this.incTempSize = 0;
  },

  setBurned: function(init){
    this.burned = true;
    this.fill = this.colors.burned;
    this.resetTemp();

    if (!init){
      Particles.createEmitter(this, {
        auto: true,
        max: 20,
        rate: 0.2,
        ratep: 10,
        life: 1,
        rad: 20,
        size: 2,
        cFrom: [255,0,0,0.8],
        cTo: [10,0,0,0.1],
        g: { x: 0, y: 100}
      });

      var self = this;
      window.setTimeout(function(){
        Particles.stopEmiter(self);
      }, 1000);
    }
  },

  update: function(){

    if (this.burned){
      return;
    }

    if (this.blowing && $.tm > this.blowingEnd){
      this.blowing = false;
    }

    if (this.hasEarth){
      this.fill = this.colors.earth;
      this.resetTemp();
      return;
    }

    if (this.nears.every(function(n){ return n.burned; })){ //has no paths
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

    this.temp += this.incTemp * this.incTempSize * $.dt;

    if (this.temp <= 0){
      this.resetTemp();
    }

    this.fill = $.C.lerp(this.colors.cold, this.colors.burn, this.temp);

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
    this.entities = [];
    this.paths = new $.Paths();
    
    // Full-screen
    var radius = $.V.divide(config.size, 2);

    // Full-screen with margin
    var margin = config.world.margin;
    radius.x -= margin.x;
    radius.y -= margin.y;

    // Center of Screen
    var center = $.V.center($.V.zero, config.size);

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
      , boundMin = $.V.add(center, $.V.multiply(rad, -1))
      , boundMax = $.V.add(center, rad)
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

      var ps = $.M.polygonPoints(center, (i*ringsGap) + start, nodesByRing);
      countNodes += ps.length;
      var cRing = [];

      if (i === 10 || i === 20){
        rndRadius += 0.1;
      }

      ps.forEach(function(p){

        var np = $.V.round($.V.add(p, $.M.rndInCircle(rndRadius)));
        var node = new $.Node({ pos: np });
        
        if ($.V.isOut(np, boundMin, boundMax)) {
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

    var j = ringsAm, k, l1, l2;

    // Paths connections between rings
    while(j--){
      var currRing = rings[j];
      var max = currRing.length;
      k = max;

      while(k--){
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

  findNodeByCollider: function(){
    this.entities.forEach(function (node) {
      if ($.V.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
        node[config.methods[config.elements.indexOf(this.element)]]();
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

  tBurn: 0.5,
  burned: false,
  heat: null,

  setHeat: function(from, to, t){
    var h = this.heat;
    if (h && h.id !== from.cid){
      return;
    }

    h = this.heat || {}; 

    var dblT = t*2;
    h.id = from.cid;
    h.from = from.pos;
    h.to = $.V.round($.V.lerp(from.pos, to.pos, dblT > 1 ? 1 : dblT ));
    this.heat = h;
  },

  update: function(){
    var na = this.na
      , nb = this.nb
      , naT = na.temp
      , nbT = nb.temp
      , naC = na.fill
      , nbC = nb.fill;

    if (!naT && !nbT){
      this.heat = null;
    }
    else if (naT > 0){
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

    if ($.C.eql(naC,  nbC)){
      this.color = naC;
    }
    else {
      this.color = $.C.lerp(naC, nbC, this.tBurn);
    }

    if (na.burned || nb.burned) {
      this.heat = null;
      this.burned = true;
      this.color = [,,,0.2];
    }

    this.pos = this.na.pos;
    this.to = this.nb.pos;
  },

  draw: function(ctx){
    $.Path._super.draw.apply(this, arguments);

    if (this.heat){
      $.Renderer.line(ctx, {
        pos: this.heat.from,
        to: this.heat.to,
        size: 5,
        color: [255,0,0,0.4]
      });
    }

  },

});


$.Paths = $.Collection.extend({

  start: function(){
    this.entities = [];
  },

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

  stroke: {
    color: "#fff",
    size: 2
  },

  active: false,
  element: "fire",
  last: "",

  start: function(){
    var self = this;

    Controls
      .on("pressing", function(pos){
        self.pos = pos;
        self.active = true;
      })
      .on("moving", function(pos){
        self.pos = pos;
      })
      .on("release", function(){
        self.active = false;
      })
      .on("element", function(element){
        self.element = element;
      });

    this.emiter = Particles.createEmitter(this, {
      max: 50,
      rate: 0.1,
      ratep: 2,
      life: 1,
      rad: 5,
      g: { x: 0, y: 0}
    });

    this.setEmitter();
  },

  setEmitter: function(){
    var size = this.active ? 10 : 5;
    var effects = [
          [ -100, [100,,,0.8] ]
        , [ 100, [75,180,240,0.8], [200,200,250,0.1] ]
        , [ 100, [165,140,80,0.8] ]
      ]
      , e = this.emiter.options
      , effect = effects[config.elements.indexOf(this.element)];

    function set(g, from, to){
      to = to || [10,10,10,0.1];
      e.g.y = g;
      e.cFrom = from;
      e.cTo = to;
      e.size = size;
    }

    this.last = this.element + ":" + this.active;

    if (effect){
      Particles.playEmiter(this);
      set.apply(null, effect);
      return;
    }

    Particles.stopEmiter(this);
  },

  update: function(){
    var element = this.element
      , idx = config.elements.indexOf(element)
      , alpha = 0.4
      , sizes = [20,20,20,50]
      , colors = [
          [255,,, alpha]
        , [75,180,240, alpha]
        , [165,140,80, alpha]
        , [,220,255, alpha]
      ];

    this.fill = colors[idx];
    this.radius = sizes[idx];

    if (this.last !== (element + ":" + this.active)){
      this.setEmitter();
    }
  }
  
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
    this.pos = $.V.round(options.pos);
    this.onDead = options.onDead;

    this.speed = this.calmSpeed;

    this.move = [];
    for(var i=0;i<3;i++){
      this.move.push({ x: i*32, y: 0, w: 32, h: 32 });
    }

    this.sprite = this.move[0];
  },

  setNode: function(nFrom, nTo){
    this.nFrom = nFrom;
    this.nTo = nTo;

    this.t_startMove = $.tm;
    this.journeyLength = $.V.magnitude(nFrom.pos, nTo.pos);
    this.traveling = true;

    this.angle = $.V.angleTo(this.pos, this.nTo.pos);
  },

  setDead: function(){
    if (!this.isDead){
      this.nFrom = null;
      this.nTo = null;
      this.dying = true;
      this.vel = 1;
      this.pos = {
        x: this.pos.x,
        y: this.pos.y
      };
      this.onDead();
    }
  },

  burn: function(){
    this.building = false;
    this.burning = $.tm + 3000;
    this.temp = 1;

    Particles.createEmitter(this, {
      auto: true,
      max: 50,
      rate: 0.1,
      ratep: 2,
      life: 1,
      rad: 10,
      size: 10,
      cFrom: [100,,,0.4],
      cTo: [10,10,10,0.1],
      g: { x: 0, y: -100}
    });
  },

  animate: function(){

    if (!this.staying){
      this.lastFrameTime -= $.ft;

      if (this.lastFrameTime <= 0){
        this.spriteIndex++;
        if (this.spriteIndex > 2){
          this.spriteIndex = 0;
        }

        this.lastFrameTime = this.animTime / this.speed;
      }
    }

  },

  updateTemp: function(){
    var nfrom = this.nFrom
      , nto = this.nTo
      , nfromT = nfrom.temp
      , ntoT = nto.temp;

    if (this.temp === 1){
      return;
    }

    if (nfrom.blowing || nto.blowing){
      this.temp = 0.1;
      return;
    }

    if (!nfromT && !ntoT){  
      this.temp = 0;
      return;
    }

    if (nfromT >= ntoT){
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
    var tm = $.tm
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
        this.t_nextStay = tm + tstay / $.M.rnd(2, 5);
      }
    }
    else if (tm > this.t_nextStay && $.M.rnd01() < 0.8){
      this.staying = true;
      this.t_startStay = tm;
      this.t_stay = $.M.rnd(cfgTm.tStayA, cfgTm.tStayB);
    }

  },

  // returns true if the travel is ended
  updateMove: function(){

    if (!this.building && (this.nFrom.burned || this.nTo.burned)){
      this.setDead();
      return;
    }

    var distCovered = ($.tm - this.t_startMove) * this.speed;
    var fracJourney = distCovered / this.journeyLength;
    
    if (fracJourney > 1) {
      this.pos = $.V.clone(this.nTo.pos);
      this.nTo.revive();
      
      if (this.burning){
        this.nTo.burn();
      }
      
      this.traveling = false;
      this.building = false;

      return true;
    }

    this.pos = $.V.round($.V.lerp(this.nFrom.pos, this.nTo.pos, fracJourney));

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

    if (this.dying){
      this.vel++;
      this.pos.y += this.vel;

      if (this.pos.y > config.size.y){
        this.isDead = true;
        Particles.stopEmiter(this);
      }
      return;
    }
    
    this.updateTemp();

    if (this.building || this.traveling){
      if (!this.updateMove()){
        return;
      }
    }

    this.updateState();

    if (this.burning && this.burning < $.tm){
      this.setDead();
    }
  },

  draw: function(ctx){
    if (this.isDead){
      return;
    }

    if (this.building){
      $.Renderer.line(ctx, {
        pos: this.pos,
        to: this.nFrom.pos,
        size: 2,
        color: $.C.white
      });
    }

    $.Spider._super.draw.apply(this, arguments);
  }

});


$.Spiders = $.Collection.extend({

  spidersExit: 0,
  spidersKilled: 0,
  stats: {},
  amount: 0,

  applyPos: null,
  applyRatio: 0,
  element: null,

  start: function(){
    this.entities = [];

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
      idx = $.M.rnd(0, len-1);
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
    if (!node.hasEarth && !node.temp && $.M.rnd01() > 0.7) {
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
    if ($.V.pointInCircle(spider.pos, node.pos, 5)) {
     
      if (!this.gonnaBuildWeb(node, spider) && !this.gotNearNodeToGo(node, spider)){
        if (node.burned){
          spider.setDead();
        }
      }
    }
  },

  findSpidersByCollider: function(){
    this.entities.forEach(function (spider) {
      if ($.V.pointInCircle(this.applyPos, spider.pos, this.applyRatio)) {
        spider[config.methods[config.elements.indexOf(this.element)]]();
      }
    }, this);
  },

  update: function(){

    if (this.applyPos && this.element === "fire"){
      // only interact with fire so far
      this.findSpidersByCollider();
    }
    
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

    this.pos = $.V.prod($.V.one, cfg.size);
    this.pos.x -= cfgm.x + 10;
    this.pos.y -= cfgm.y + 20;
    
    this.saved = [];
    this.saving = [];

    var emitter = new $.Entity({
      pos: { x: this.pos.x - 100, y: this.pos.y - 100 }
    });

    var g = $.V.normal(emitter.pos, this.pos);

    Particles.createEmitter(emitter, {
      auto: true,
      max: 10,
      rate: 0.5,
      ratep: 1,
      life: 1,
      rad: 50,
      size: 2,
      cFrom: [200,200,200,0.5],
      cTo: [200,200,200,0.1],
      g: $.V.multiply(g, 150)
    });
  },

  setNodesInside: function(nodes){
    nodes.forEach(function(node){
      if ($.V.pointInCircle(node.pos, this.pos, this.size)){
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
      if (!spider.burning && !spider.dead && !spider.exited){

        if ($.V.pointInCircle(spider.pos, this.pos, this.size)){
          spider.building = false;
          spider.exited = true;
          spider.vel = { x: 0, y: 0 };
          this.saving.push(spider);
        }
      }
    }, this);

    var force = $.dt * this.suckForce
      , p = this.pos;

    this.saving.forEach(function(spider){

      if (!spider.catched){
        var sp = spider.pos;
        var imp = $.V.normal(sp, p);
        spider.vel = $.V.add(spider.vel, $.V.multiply(imp, force)); 
        spider.pos = $.V.add(sp, spider.vel);
        
        if ($.V.pointInCircle(spider.pos, p, 5)){
          spider.catched = true;
          this.saved.push(spider);
        }
      }

    }, this); 

  }

});


$.Vacuum = $.Entity.extend({

  targetLen: 0,

  start: function(options){
    this.target = options.target;
    this.size = config.vacuum.size;

    this.current = 0;

    this.offx = 30;
    this.offy = 10;

    this.recipePos = { x: this.offx + 165, y: this.offy + 65 };
    this.recipeSize = { x: 80, y: 300 };

    this.createGraphics();
  },

  createGraphics: function(){
    var size = $.sprites.vacuum.size;

    this.bgBack = new $.Sprite({
      resource: "vacuum",
      pos: $.V.center({ x: this.offx, y: this.offy }, size),
      size: size
    });

    var c = [187,187,249];

    var opts = {
      pos: this.recipePos,
      size: this.recipeSize,
      corner: 6,
      fill: $.C.white,
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
      size: 25,
      color: "#00ff00"
    });

  },

  update: function(){
    this.current = this.target.saved.length;

    var p = this.recipePos
      , s = this.recipeSize
      , centerY = p.y + (s.y/2)
      , centerX = p.x + (s.x/2)
      , sinTime = $.tm * 2 * Math.PI;

    this.target.saved.forEach(function(spider){

      if (!spider.inVacuum){
        spider.inVacuum = true;
        
        spider.vacuum = {
          ampY: $.M.rnd(10, centerY/2),
          velY: $.M.rnd(600, 1000),
          ampX: $.M.rnd(5, 20),
          velX: $.M.rnd(2000, 6000),
          rot: $.M.rnd(1, 5)/10
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
    
    this.stats.text = _.pad(this.current, 2) + " / " + _.pad(this.targetLen, 2);
  },

  draw: function(ctx){
    this.bgBack.draw(ctx);
    
    this.cilinder.draw(ctx);
    
    this.target.saved.forEach(function(spider){
      spider.draw(ctx);
    });

    this.glass.draw(ctx);
    this.stats.draw(ctx);
  },

});


$.Stats = $.Collection.extend({

  pos: { x: 1, y: 0 },

  colors: {
    kills: "#ff0000"
  },

  start: function(){
    this.entities = [];
    this.pos = $.V.prod(this.pos, config.size);

    this.colors.alives = "#" + $.sprites.color;

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
      , mW = 30
      , mH = 40
      , spSize = { x: size, y: size }
      /*, hSpSize = { x: size/2, y: size/2 }*/;

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

    this.iconAPos = spider.pos;
    this.entities.push(new $.Sprite(spider));

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH
    };

    this.iconKPos = spider.pos;
    this.entities.push(new $.Sprite(spider));
    
    this.entities.push(new $.Text({
      pos: { x: spider.pos.x-15, y: spider.pos.y },
      text: "X",
      size: 30,
      color: this.colors.kills
    }));

  },

  createText: function(){
    var txtSize = 30
      , killPos = this.iconKPos
      , alivePos = this.iconAPos;

    this.textKills = new $.Text({
      pos: { x: killPos.x - txtSize*3.5, y: killPos.y },
      size: txtSize,
      color: this.colors.kills
    });
    this.entities.push(this.textKills);

    this.textAlives = new $.Text({
      pos: { x: alivePos.x - txtSize*2.5, y: alivePos.y },
      size: txtSize,
      color: this.colors.alives
    });
    this.entities.push(this.textAlives);

  },

  update: function(stats){
    this.stats = stats;

    this.textKills.text = stats.killed + " / " + this.maxKills;
    this.textAlives.text = _.pad(stats.alives, 2);
  },

});


$.Element = $.Collection.extend({

  size: { x: 96, y: 96 },

  start: function(/*options*/){
    this.entities = [];

    //this.name = options.name;
    //this.key = options.key;
    //this.showKeys = options.showKeys;
    //this.sprite = options.sprite;

    this.active = false;
    this.current = false;

    this.createElement();
  },

  createElement: function(){
    var size = this.size,
      pos = this.pos;
    
    this.bg = new $.Rect({
      pos: pos,
      size: size,
      fill: [255,255,255, 0.1],
      stroke: { size: 4, color: [30,30,30,1] },
      corner: 8
    });
    this.entities.push(this.bg);

    this.icon = new $.Sprite({
      resource: "elements",
      pos: $.V.center({ x: pos.x+3, y: pos.y+6 }, { x: size.x-6, y: size.y-6 }),
      size: size,
      angle: 0,
      sprite: this.sprite
    });
    this.entities.push(this.icon);

    var txtPos = { x: pos.x, y: pos.y + size.y * 1.1 };
    var txtSize = 20;

    if (this.showKeys){

      this.ctrlKey = new $.Rect({
        pos: { x: txtPos.x - txtSize/2, y: txtPos.y - txtSize},
        size: $.V.multiply($.V.one, txtSize*2),
        fill: [,,,1],
        corner: 4
      });
      this.entities.push(this.ctrlKey);

      this.txtKey = new $.Text({
        text: this.key,
        pos: txtPos,
        size: txtSize,
        color: $.C.white
      });
      this.entities.push(this.txtKey);
    }
  },

  update: function(){
    this.bg.fill = [255,255,255, this.active ? 1 : 0.1];
    this.bg.stroke.color = this.current ? $.C.white : [,,,1];
  },

});


$.Elements = $.Collection.extend({

  pos: { x: 20, y: 50},
  size: 96,
  gap: 50,
  showKeys: true,

  start: function(){
    this.entities = [];

    this.current = "fire";
    this.active = false;

    this.keys = ["Q", "W", "E", "R"];
    this.elements = config.elements;

    this.sprites = {};
    for(var i=0;i<4;i++){
      this.sprites[this.elements[i]] = { x: i*32, y: 0, w: 32, h: 32 };
    }

    this.createElements();
  },

  createElements: function(){
    var size = this.size
      , gap = this.gap + size
      , p = this.pos
      , showKeys = this.showKeys;

    this.elements.forEach(function(ele, i){

      this.entities.push(new $.Element({
        pos: { x: p.x, y: p.y + (i * gap) },
        size: { x: size, y: size },
        name: ele,
        key: this.keys[i],
        sprite: this.sprites[ele],
        showKeys: showKeys
      }));

    }, this);
  },

  update: function(){
    this.entities.forEach(function(e){

      e.current = (e.name === this.current);
      e.active = (e.current && this.active);
      e.update();
      
    }, this);
  },

});


$.sprites = {

  bgColor: "rgba(0,0,0,0.1)",

  bg: [
    [1, , , ,1, , , , ,1],
    [ ,1, ,1, , , , ,1, ],
    [ , ,1, , , , ,1, , ],
    [ ,1, ,1, , ,1, , , ],
    [1, , , ,1,1, , , , ],
    [ , , , ,1,1, , , ,1],
    [ , , ,1, , ,1, ,1, ],
    [ , ,1, , , , ,1, , ],
    [ ,1, , , , ,1, ,1, ],
    [1, , , , ,1, , , ,1],
  ],


  // 0: transparent
  // 1: all
  // 2, 3 & 4: 0,1,2 sprites
  // 5: 2 & 3
  // 6: 3 & 4
  // 7: 2 & 4

  color: "b9ce5a",

  spider: [
    [ , , , , , , , , , , , , , , , ],
    [ , , , , , , , , , , , , , , , ],
    [ , , , ,7, ,3, ,3, ,7, , , , , ],
    [ , ,1, ,7,1,3, ,3,1,7,3,7, , , ],
    [ ,7,3,1, , ,1, ,1, ,3,7,3,7, , ],
    [2,4,3, ,1, ,1, ,1, ,1, , ,3,7, ],
    [ ,4,3, , ,1,1,1,1,1, , , ,3,2, ],
    [ , , , ,1,1,1,1,1,1,1,1, ,3,2, ],
    [ ,3,2, ,1,1,1,1,1,1,1,1, ,4, , ],
    [ ,3,2, , ,1,1,1,1,1, , , ,4,3, ],
    [4,3,2, ,1, ,1, ,1, ,1, , ,4,3, ],
    [ ,4,3,1, , ,1, ,1, ,3,1, ,6, ,2],
    [ , , ,3,1,7,3,3,3,7,7, ,1, ,2, ],
    [ , , , ,7, ,3, ,3, ,7, , ,2, , ],
    [ , , , , , , , , , , , , , , , ],
    [ , , , , , , , , , , , , , , , ],
  ],

  colors: [
    [,"ff1414","ffc700", "fff600"],
    [,"5481ce","5cb1f2", "90e3f9"],
    [,"966910","bf8f35"],
    [,"aed7ef","e3f9fc"]
  ],

  elements: [
    [
      [ , , , , , , ,1,1, , , , , , , ],
      [ , , , , , ,1,1,1,1, , , , , , ],
      [ , , , , , ,1,1,1,1,1, , , , , ],
      [ , , , , ,1,1,1,2,1,1, , , , , ],
      [ , , ,1, ,1,1,2,2,1,1, , , , , ],
      [ , ,1,1, ,1,1,2,2,1,1, ,1, , , ],
      [ ,1,1,1, ,1,1,2,2,1,1, ,1,1, , ],
      [ ,1,1,1, ,1,1,2,2,1,1, ,1,1,1, ],
      [ ,1,2,1,1,1,1,2,2,1,1, ,1,1,1, ],
      [ ,1,2,2,1,1,2,2,2,2,1,1,1,2,1, ],
      [ ,1,2,2,2,2,2,3,3,2,2,2,2,2,1, ],
      [ ,1,2,2,3,3,2,3,3,2,3,3,2,2,1, ],
      [ ,1,1,2,2,3,3,3,3,3,3,2,2,1,1, ],
      [ , ,1,1,2,2,3,3,3,2,2,2,1,1, , ],
      [ , , ,1,1,2,2,2,2,2,2,1,1, , , ],
      [ , , , ,1,1,1,1,1,1,1,1, , , , ],
    ], [
      [ , , , , , , ,1,1, , , , , , , ],
      [ , , , , , , ,1,1, , , , , , , ],
      [ , , , , , ,1,1,1,1, , , , , , ],
      [ , , , , , ,1,1,1,1, , , , , , ],
      [ , , , , ,1,1,1,2,1,1, , , , , ],
      [ , , , ,1,1,1,2,2,1,1,1, , , , ],
      [ , , , ,1,1,2,2,2,2,1,1,1, , , ],
      [ , , ,1,1,2,2,2,2,3,2,1,1, , , ],
      [ , ,1,1,2,2,2,2,3,3,3,2,1,1, , ],
      [ , ,1,1,2,2,2,2,2,3,3,2,1,1, , ],
      [ , ,1,1,2,2,2,2,2,2,2,2,1,1, , ],
      [ , ,1,1,2,2,2,2,2,2,2,2,1,1, , ],
      [ , ,1,1,2,2,2,2,2,2,2,2,1,1, , ],
      [ , ,1,1,1,2,2,2,2,2,2,1,1, , , ],
      [ , , ,1,1,1,1,1,1,1,1,1, , , , ],
      [ , , , ,1,1,1,1,1,1,1, , , , , ],
    ], [
      [ , , , , , , , , , , , , , , , ],
      [ , , , , , , , , , , , , , , , ],
      [ , , , , , , ,1,1, , , , , , , ],
      [ , , , , , ,1,1,1,1, , , , , , ],
      [ , , , , ,1,1,2,2,1,1, , , , , ],
      [ , , , , ,1,2,2,2,2,1,1, , , , ],
      [ , , , ,1,1,2,1,2,2,2,1, , , , ],
      [ , , , ,1,2,2,2,1,2,2,2,1, , , ],
      [ , , ,1,2,2,2,2,2,2,1,1,2,1, , ],
      [ , ,1,1,2,2,2,1,2,2,2,2,2,1, , ],
      [ , ,1,2,2,1,1,2,2,1,2,2,2,2,1, ],
      [ ,1,1,2,2,2,2,2,2,2,1,1,2,2,1, ],
      [ ,1,2,2,2,2,2,1,1,2,2,2,2,2,1, ],
      [ ,1,2,2,1,2,1,2,2,1,2,2,2,2,1, ],
      [ , ,1,2,2,2,2,2,2,2,2,2,2,1, , ],
      [ , ,1,1,1,1,1,1,1,1,1,1,1,1, , ],
    ], [
      [ , , , , , ,1,1,1,1, , , , , , ],
      [ , , , , ,1,2,2,2,2,1, , , , , ],
      [ , , , ,1,2,2,1,2,2,2,1, , , , ],
      [ , , ,1,2,2,2,2,2,1,2,1, , , , ],
      [ , ,1,1,1,2,2,2,2,2,2,1,1,1, , ],
      [ ,1,2,2,2,1,2,2,2,2,1,2,2,2,1, ],
      [ ,1,2,1,2,2,2,1,2,2,2,2,2,2,1, ],
      [ ,1,2,2,2,1,2,2,2,1,2,2,2,2,1, ],
      [ , ,1,1,1,1,2,1,2,1,1,2,2,1, , ],
      [ , , , , ,1,2,1,2,1, ,1,1, , , ],
      [ , , , , ,1,2,1,2,1, , , , , , ],
      [ , , , , ,1,2,2,2,1, , , , , , ],
      [ , , , , ,1,2,2,2,1, , , , , , ],
      [ , , , ,1,2,2,1,2,2,1, , , , , ],
      [ , , , ,1,2,1,2,1,2,1, , , , , ],
      [ , , , ,1,1,1,1,1,1,1, , , , , ],
    ]
  ],

  vacuum: {
    size: { x: 300, y: 500 },
    path: [ [70,460], [120,400], [160,445], [195,450, 185,380], [225,380], [230,510, 145,475] ],
    fill: '#9e9e9e', 
    stroke: '#474747',
    line: 3,
    box: {
      pos: { x: 150, y: 50 },
      size: { x: 110, y: 330 },
      corner: 6,
      fill: [158,158,158],
      stroke: {
        color: [71,71,71],
        size: 2
      }
    }
  }

};

$.Creator = $.Base.extend({}, {

  getSprites: function(){
    var sprites = $.sprites
      , gen = this.generate;

    return {
      bg: gen(sprites.bg, sprites.bgColor, true, 1),
      spider: gen(sprites.spider, sprites.color, true, 3),
      favicon: gen(sprites.spider, sprites.color, true, 1, 1, true),
      elements: gen(sprites.elements, sprites.colors),
      vacuum: this.drawPath(sprites.vacuum)
    };
  },

  generate: function(sprite, _color, multiple, _phases, bSize, url){
    var img = new window.Image();
    var phases = multiple ? _phases : sprite.length;
    
    var canvas = document.createElement('canvas');
    
    var lh = multiple ? sprite.length : sprite[0].length;
    var lw = multiple ? sprite[0].length: sprite[0][0].length;
    
    var pw = bSize || 2, ph = bSize || 2;
    
    var w = pw*lh; 
    var h = ph*lw;
    
    canvas.width = w*phases;
    canvas.height = h;
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, w, h);
    
    for( var k = 0; k < phases; k++){
      for( var y = 0; y < lh; y++ ) {
        for( var x = 0; x < lw; x++ ) {
          var v, sp, c;

          if (multiple){
            v = sprite[y][x];
            c = (_color.indexOf("rgb") > -1 ? _color : "#" + _color);
            sp = k+2;
          }
          else {
            v = sprite[k][y][x];
            c = "#" + _color[k][v];
            sp = k;
          }

          if (
            (multiple && (
                (v===5 && (sp===2 || sp===3)) ||
                (v===6 && (sp===3 || sp===4)) ||
                (v===7 && (sp===2 || sp===4)) ||
                (v===1 || v===sp))
              ) ||
            (!multiple && v) 
          ){
            ctx.save();
            ctx.fillStyle = c;
            ctx.fillRect( (x*pw) + w*k, y*ph, pw, ph );
            ctx.restore();
          }
        }
      }
    }

    if (url){
      return canvas.toDataURL();
    }
    
    img.src = canvas.toDataURL("image/png");
    canvas = null;

    return img;
  },

  drawPath: function(opts){
    var img = new window.Image();

    var path = opts.path
      , fill = opts.fill
      , stroke = opts.stroke
      , line = opts.line
      , size = opts.size;

    var canvas = document.createElement('canvas');
    
    canvas.width = size.x;
    canvas.height = size.y;

    var ctx = canvas.getContext("2d");

    ctx.beginPath();

    var first = path[0];
    ctx.moveTo(first[0], first[1]);

    for (var i=1; i<path.length; i++){
      var p = path[i];
      if (p.length === 4){
        ctx.quadraticCurveTo(p[0], p[1], p[2], p[3]);
      }
      else {
        ctx.lineTo(p[0], p[1]);
      }
    }

    ctx.lineTo(first[0], first[1]);

    if (fill){
      ctx.fillStyle = fill;
      ctx.fill();
    }

    ctx.lineWidth = line;
    ctx.strokeStyle = stroke;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.closePath();

    $.Renderer.rect(ctx, opts.box);

    img.src = canvas.toDataURL("image/png");
    canvas = null;

    return img;
  }

});


$.Modal = $.Base.extend({

  start: function(options){
    this._onExit = options.onExit;

    this.modalItems = [];

    this.initBackDrop();
    this["init" + this.type]();

    document.addEventListener("keyup", this._onKeyUp.bind(this));
  },

  _onKeyUp: function(e){
    var curr = window.modal;
    if (curr !== this.type){
      return;
    }

    var idx = this.levelIndex;
    var key = (e.which || e.keyCode);

    if (key === 13){
      this.hide();
      this._onExit();
      return;
    }

    if (curr === "level"){
      idx = ( key === 40 ? idx+1 : (key === 38 ? idx-1 : idx));
      idx = ( idx < 0 ? 3 : ( idx > 3 ? 0 : idx ));
      
      this.levelIndex = idx;
      this.updateLevel();
    }
  },

  updateLevel: function(){
    if (this.levels){
      this.levels.forEach(function(lvl, i){
        lvl.color = (i === this.levelIndex ? "#00ff00" : "#fff");
      }, this);
    }

    this.redraw();
  },

  initBackDrop: function(){
    this.bg = new $.Rect({
      pos: { x: 0, y: 0},
      size: config.size,
      corner: 10,
      fill: [0,0,0,0.5]
    });
  },

  initPressKey: function(pos){
    var enter = {
      text: "-- PRESS ENTER --",
      pos: pos,
      size: 20,
      color: [0,255,0,1]
    };

    enter.pos.x += (enter.size*enter.text.length*1.1)/2;

    this.pressKey = new $.Text(enter);
  },

  createHolder: function(size, txt, center){
    var pos = $.V.center($.V.zero, config.size);
    pos.x -= size.x/2;
    pos.y -= size.y/2;

    var holder = new $.Rect({
      pos: pos,
      size: size,
      fill: [30,30,30,1],
      corner: 10,
      stroke: {
        size: 3,
        color: [255,255,255,1]
      }
    });

    var title = {
      text: txt,
      pos: $.V.center(pos, size),
      size: 20
    };

    title.pos.x -= (title.size*title.text.length*center)/2;
    title.pos.y = pos.y + title.size*2;

    var tlt = new $.Text(title);

    this.modalItems.push(holder);
    this.modalItems.push(tlt);

    return {
      holder: holder,
      title: tlt
    };
  },

  initmain: function(){ 
    var items = this.modalItems = [];

    var size = { x: 600, y: 550 };
    var holderCtn = this.createHolder(size, document.title, 0.8);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var sub = {
      text: "Use The Elements to lead spiders into the Vacuum!",
      pos: $.V.center(pos, size),
      size: 15,
    };

    sub.pos.x -= (sub.size*sub.text.length*0.6)/2;
    sub.pos.y = tltPos.y + sub.size*2.5 +10;

    items.push(new $.Text(sub));

    var elePos = { x: pos.x + 30, y: sub.pos.y + 35 };
    items.push(new $.Elements({
      pos: elePos,
      size: 66,
      gap: 15,
      showKeys: false
    }));

    var textsTlts = [
      "BURN",
      "COOL",
      "DIRTY",
      "BLOW"
    ];

    var textsDesc = [
      "Burn the web but watch to not burn Spiders!",
      "Fire propagates fast!, use the water to cool it",
      "Stops the fire and avoid spiders re-build the web",
      "Burn faster, annoy spiders and removes dirty"
    ];

    textsTlts.forEach(function(txt, i){
      var p = { x: elePos.x + 80, y: (i * 80) + elePos.y + 20 };

      items.push(new $.Text({
        text: txt,
        pos: p,
        size: 15
      }));

      items.push(new $.Text({
        text: textsDesc[i],
        pos: { x: p.x, y: p.y + 25},
        size: 15
      }));
    });

    var info = {
      text: "~ Apply an Element by clicking on the Web ~",
      pos: $.V.center(pos, size),
      size: 15,
      color: [255, 150, ]
    };

    info.pos.x -= (info.size*info.text.length*0.6)/2;
    info.pos.y = size.y-25;

    items.push(new $.Text(info));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);
  },

  initlevel: function(){
    var items = this.modalItems = [];
    var levels = this.levels = [];

    var size = { x: 600, y: 500 };
    var holderCtn = this.createHolder(size, "How good you think you are?", 0.6);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var textsOpts = [
      "    AMATEUR",
      "PRETTY GOOD",
      "EXPERIENCED",
      "     BUSTER!"
    ];

    var posOpts = { x: pos.x + size.x/2 - 70 , y: tltPos.y + 80 };
    textsOpts.forEach(function(txt, i){
      var p = { x: posOpts.x, y: (i * 60) + posOpts.y + 10 };

      var txtLvl = new $.Text({
        text: txt,
        pos: p,
        size: 15,
        color: "#fff"
      });

      items.push(txtLvl);
      levels.push(txtLvl);
    });

    this.levelIndex = 0;

    var info = {
      text: "~ shh .. be quiet, don't scare spiders ~",
      pos: $.V.center(pos, size),
      size: 15,
      color: [200, 200, 200]
    };

    info.pos.x -= (info.size*info.text.length*0.55)/2;
    info.pos.y = size.y-10;

    items.push(new $.Text(info));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);

    this.updateLevel();
  },

  initend: function(){
    var items = this.modalItems = [];

    var size = { x: 600, y: 250 };
    var holderCtn = this.createHolder(size, "LEVEL COMPLETED!", 0.85);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var sub = {
      text: "Good Job. Try a harder level.",
      pos: $.V.center(pos, size),
      size: 15,
    };

    sub.pos.x -= (sub.size*sub.text.length*0.6)/2;
    sub.pos.y = tltPos.y + sub.size*4 +10;

    items.push(new $.Text(sub));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);
  },

  hide: function(){
    var s = config.size;
    this.ctx.clearRect(0, 0, s.x, s.y);

    window.modal = "";
  },

  show: function(){
    this.hide();

    var ctx = this.ctx;
    var items = this.modalItems;

    this.bg.draw(ctx);

    if (this.type === "end"){
      items[1].text = this.won ? "LEVEL COMPLETED!" : "SPIDER MURDERER!";
      items[2].text = this.won ? 
        "Good Job. Try a harder level." : "Don't kill them!. Let's try again";
    }

    items.forEach(function(item){
      item.draw(ctx);
    });

    this.pressKey.draw(ctx);

    window.modal = this.type;
  },

  redraw: function(){
    this.hide();
    this.show();
  }

});

$.Manager = $.Base.extend({

  level: 0,

  start: function(){
    Particles = new $.Particles();

    var lvl = config.levels[this.level];
    this.spidersAm = lvl[0];
    this.spidersWin = lvl[1];
    this.spidersKill = lvl[2];

    this.cursor = new $.Cursor();
    this.nodes = new $.Nodes();
    this.paths = new $.Paths();
    this.target = new $.Target();

    this.vacuum = new $.Vacuum({
      target: this.target,
      targetLen: this.spidersWin
    });

    this.elements = new $.Elements();

    this.spiders = new $.Spiders({
      nodes: this.nodes,
      amount: this.spidersAm
    });

    this.stats = new $.Stats({
      maxKills: this.spidersKill
    });

    this.target.setNodesInside(this.nodes.getNodes());

    this.pauseMsg = new $.Text({
      pos: { x: 10, y: config.size.y - 20 },
      text: "[P] Pause/Help",
      size: 15
    });
  },

  checkState: function(){
    var stat = this.stats.stats;

    if (stat.saved >= this.spidersWin){
      this.onEnd(stat, true);
    }
    
    if (stat.killed >= this.spidersKill){
      this.onEnd(stat, false);
    }
  },

  update: function(){
    var cursor = this.cursor
      , nodes = this.nodes
      , spiders = this.spiders
      , elements = this.elements;

    cursor.update();

    elements.current = cursor.element;
    elements.active = cursor.active;

    spiders.applyPos = nodes.applyPos = null;

    if (cursor.active){
      spiders.applyPos = nodes.applyPos = cursor.pos;
      spiders.applyRatio = nodes.applyRatio = cursor.radius;
      spiders.element = nodes.element = cursor.element;
    }

    nodes.update();
    spiders.update();
    this.target.update(spiders.getSpiders());
    this.vacuum.update();
    this.stats.update(spiders.stats);

    elements.update();

    Particles.update();

    this.checkState();
  },

  draw: function(viewCtx, worldCtx, vacuumCtx){
    var s = config.size;
    var vs = config.vacuum.size;

    viewCtx.clearRect(0, 0, s.x, s.y);
    worldCtx.clearRect(0, 0, s.x, s.y);
    vacuumCtx.clearRect(0, 0, vs.x, vs.y);

    Particles.draw(viewCtx);

    this.cursor.draw(viewCtx);
    this.nodes.draw(worldCtx);
    this.spiders.draw(worldCtx);
    this.target.draw(worldCtx);

    this.vacuum.draw(vacuumCtx);
    this.stats.draw(viewCtx);
    this.elements.draw(viewCtx);

    this.pauseMsg.draw(viewCtx);
  },

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

    $.tm = this.time;
    $.dt = this.deltaTime;
    $.ft = this.frameTime;
  },

  tick: function(){
    var now = Date.now();
    var delta = now - this.lastTime;

    if (delta < this.minFrameTime ) {
      return false;
    }

    if (delta > 2 * this.typicalFrameTime) { // +1 frame if too much time elapsed
      $.ft = this.typicalFrameTime;
    } else {  
      $.ft = delta;      
    }

    this.frameTime = $.ft;
    $.dt = $.ft/1000;

    this.time += $.ft;
    $.tm = this.time;
    
    this.lastTime = now;

    return true;
  }

});


$.Game = $.Base.extend({

  tLoop:  null,
  paused:  false,

  start: function(){
    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();

    this.started = false;

    var self = this;
    var mctx = this.modalsCtx;

    this.levelModal = new $.Modal({
      ctx: mctx,
      type: "level",
      onExit: function(){
        self.createManager();
        
        self.started = true;
        self.play();
      }
    });

    this.mainModal = new $.Modal({
      ctx: mctx,
      type: "main",
      onExit: function(){
        if (self.started){
          self.play();
        }
        else {
          self.levelModal.show();
        }
      }
    });

    this.endModal = new $.Modal({
      ctx: mctx,
      type: "end"
    });

    this.mainModal.show();
  },

  createManager: function(){
    this.manager = new $.Manager({
      onEnd: this._endGame.bind(this),
      level: this.levelModal.levelIndex
    });
  },

  _endGame: function(stats, won){
    var self = this;
    this.endModal.won = won;
    
    this.endModal._onExit = function(){
      if (won){
        self.levelModal.show();
      }
      else {
        self.createManager();
        self.play();
      }
    };

    this.endModal.show();
    this.stop();
  },

  initContexts: function(){
    var size = config.size
      , vsize = config.vacuum.size
      , i = 0;

    function getContext(canvas, _size){
      canvas.width = _size.x;
      canvas.height = _size.y;
      canvas.style.zIndex = ++i;
      return canvas.getContext("2d");
    }

    this.worldCtx = getContext(this.cworld, size);
    this.viewCtx = getContext(this.cview, size);
    this.vacuumCtx = getContext(this.cvacuum, vsize);
    this.modalsCtx = getContext(this.cmodals, size);
  },

  loop: function(){
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
    if (!this.paused){
      if (Time.tick()) { this.loop(); }
      this.tLoop = window.requestAnimationFrame(this.boundGameRun);
    }
  },

});


(function(){
  var w = window;
  var doc = w.document;
  doc.title = "SPIDER BUSTERS";

  w.modal = "";
  
  function $get(id){
    return doc.getElementById(id);
  }

  var gameCtn = $get("ctn");
  //gameCtn.style.backgroundImage = 'url("'+$.sprites.bg+'")';

  function $newCanvas(id){
    var cv = doc.createElement("canvas");
    cv.id = id;
    gameCtn.appendChild(cv);
    return cv;
  }

  function configGame(){
    var ele = doc.documentElement
      , body = doc.body;

    function getSize(which){
      var offset = "offset", scroll = "scroll";
      return Math.max(
        ele["client" + which], 
        ele[scroll + which], 
        ele[offset + which],
        body[scroll + which], 
        body[offset + which] 
      );
    }

    var w = getSize("Width") - 20;
    var h = getSize("Height") - 30;

    var max = { x: 1250, y: 750 };
    var min = { x: 950, y: 640 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    size.x = (size.x < min.x ? min.x : size.x);
    size.y = (size.y < min.y ? min.y : size.y);
    
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
      levels:[ 
        [10, 5, 5], [25, 20, 5], [50, 40, 5], [80, 70, 2]
      ],
      elements: ["fire", "water", "earth", "air"],
      methods: ["burn", "cool", "dirty", "blow"]
    };
  }

  function initGame(){

    w.Time = new $.GameTime();

    w.Controls = new $.Controls({
      container: gameCtn
    });

    w.game = new $.Game({
      cview: $newCanvas("viewport"),
      cworld: $newCanvas("world"),
      cvacuum: $newCanvas("vacuum"),
      cmodals: $newCanvas("modals")
    });

    function pauseGame(){
      if (game.paused){
        game.mainModal.hide();
        game.play();
      }
      else {
        game.mainModal.show();
        game.stop(); 
      }
    }

    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();

    $.repo = $.Creator.getSprites();

    gameCtn.style.backgroundImage = 'url("' + $.repo.bg.src + '")';

    var favicon = $get("favicon");
    favicon.href = $.repo.favicon;

    initGame();
  }

  w.onload = onDocLoad;

}());