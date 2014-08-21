
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
/*
  Particles.createEmitter(this, {
    max: 3,
    type: "circle",

    g: { x: 0, y: -1 },
    d: { x: 0, y: -1 },
    
    colorFrom: [255,0,0,1],
    colorTo: [0,0,0,0.2],

    life: 2,
    size: 1
  });
*/
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
  if (!this.burned /*&& !this.target*/){
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
  this.burned = true;
  this.color = config.nodes.colors.burned;
  this.dColor = Color.toRGBA(this.color);
  this.resetTemp();
};

Node.prototype.update = function(){

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