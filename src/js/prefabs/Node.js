
module.exports = ng.Circle.extend({

  radius: 3,
  color: ng.Color.white,

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

    if (!oneBurned && ng.Mathf.rnd01() < 0.15){
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
    this.pos = ng.Vector.round(ng.Vector.add(this.pos, ng.Mathf.rndInCircle(0.2)));
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
      var idx = ng.Mathf.rnd(0, ns.length-1);
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

    this.fill = this.color = ng.Color.lerp(this.colors.cold, this.colors.burn, this.temp);

    if (this.temp > 1){
      this.setBurned();
      this.resetTemp();
      return;
    }

  }

});
