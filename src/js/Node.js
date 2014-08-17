
var Node = module.exports = function(pos){
  
  this.id = _.guid("nodes");

  this.pos = pos;
  this.size = config.nodes.size;

  this.color = config.nodes.colors.cold;
  this.dColor = Color.toRGBA(this.color);

  this.nears = [];
  this.selected = false;

  this.incTempSize = 0.1;

  this.temp = 0;
  this.incTemp = 0;
  this.burnTemp = 1;

  this.burned = false;
  this.shaked = false;
  this.originalPos = null;
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

Node.prototype.burn = function(){
  this.incTemp = 1;
};

Node.prototype.cool = function(){
  this.incTemp = -1;
};

Node.prototype.applyEarth = function(){
  console.warn("NOT IMPLEMENTED");
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

Node.prototype.setBurned = function(){
  this.burned = true;
  this.color = config.nodes.colors.burned;
  this.dColor = Color.toRGBA(this.color);
};

Node.prototype.update = function(){
  var isAlone = this.nears.every(function(n){
    return n.burned;
  });

  if (isAlone){
    this.setBurned();
    return;
  }

  if (window.blowing) {
    this.shake();

    if (this.incTemp > 0){
      this.incTempSize = 0.2; 
    }
    else { 
      this.incTempSize = 0.1; 
    }
  }
  else if (this.shaked){
    this.endShake();
  }

  this.temp += this.incTemp * this.incTempSize * Time.deltaTime;

  if (this.temp <= 0){
    this.temp = 0;
  }

  this.color = Color.lerp(config.nodes.colors.cold, config.nodes.colors.burn, this.temp);
  this.dColor = Color.toRGBA(this.color);

  if (this.temp > 1){
    this.setBurned();
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