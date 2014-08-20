
var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Cursor = require("./Cursor");
var Spiders = require("./Spiders");
var Target = require("./Target");
var Vacuum = require("./Vacuum");
var Stats = require("./Stats");
var Elements = require("./Elements");

var Manager = module.exports = function(){

  this.cursor = new Cursor();
  this.nodes = new Nodes();
  this.paths = new Paths();
  this.target = new Target();
  this.vacuum = new Vacuum(this.target);
  this.stats = new Stats();
  this.elements = new Elements();

  var self = this;

  this.spiders = new Spiders(this.nodes, function(_stats){
    self.stats.set(_stats);
  });
};

Manager.prototype.update = function(){
  
  this.cursor.update();

  window.blowing = this.cursor.blowing;
  this.elements.current = this.cursor.element;
  this.elements.active = this.cursor.active;

  if (this.cursor.active){
    this.nodes.applyPos = this.cursor.pos;
    this.nodes.applyRatio = this.cursor.size;
    this.nodes.element = this.cursor.element;
  }
  else {
    this.nodes.applyPos = null;
  }

  this.nodes.update();
  this.spiders.update();
  this.target.update(this.spiders.spiders);
  this.vacuum.update();
  this.stats.update();

  this.elements.update();
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
};