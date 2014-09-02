
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
