
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
          var nodeTo = node.getRandomNear();
          spider.setNode(node, nodeTo);
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