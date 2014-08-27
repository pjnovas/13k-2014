
var Nodes = require("./prefabs/Nodes");
var Paths = require("./prefabs/Paths");
var Cursor = require("./prefabs/Cursor");
var Spiders = require("./prefabs/Spiders");
var Target = require("./prefabs/Target");
var Vacuum = require("./prefabs/Vacuum");
var Stats = require("./prefabs/Stats");
var Elements = require("./prefabs/Elements");

var Manager = module.exports = function(){

  this.cursor = new Cursor();
  this.nodes = new Nodes();
  this.paths = new Paths();
  this.target = new Target();
  this.vacuum = new Vacuum({
    target: this.target
  });
  this.elements = new Elements();
  this.spiders = new Spiders({
    nodes: this.nodes
  });
  this.stats = new Stats();

  this.target.setNodesInside(this.nodes.getNodes());
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
  this.target.update(this.spiders.getSpiders());
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