
var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Cursor = require("./Cursor");
var Spiders = require("./Spiders");

var Manager = module.exports = function(){
  
  this.cursor = new Cursor();

  var wParts = 80;
  var hParts = 22;

  this.nodes = new Nodes({
    rows: Math.round(config.size.x / wParts),
    cols: Math.round(config.size.y / hParts),
    nodeSize: 3
  });

  this.paths = new Paths({
    nodes: this.nodes
  });

  this.spiders = new Spiders({
    nodes: this.nodes,
    amount: 100
  });
};

Manager.prototype.update = function(){
  
  this.cursor.update();

  if (this.cursor.active){
    this.nodes.applyPos = this.cursor.pos;
    this.nodes.applyRatio = this.cursor.size;
    this.nodes.element = this.cursor.element;
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