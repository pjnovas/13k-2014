
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

    if (!node.burned && nodesIds.indexOf(node.id) === -1){
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

  this.spiders.forEach(function (spider) {

      if (!spider.exited && spider.canMove()){

        nodes.some(function (node) {
          spiderNodeCollide(spider, node);
        }, this);

      }
    
      spider.update();

  }, this);
};

Spiders.prototype.draw = function(ctx){
  this.spiders.forEach(function (spider) {
    if (!spider.inVacuum){
      spider.draw(ctx);
    }
  });
};