
var Nodes = require("./Nodes");
var Paths = require("./Paths");
var Cursor = require("./Cursor");
var Spiders = require("./Spiders");
var Target = require("./Target");
var Vacuum = require("./Vacuum");

var Manager = module.exports = function(){
  this.cursor = new Cursor();
  this.nodes = new Nodes();
  this.paths = new Paths();
  this.target = new Target();
  this.vacuum = new Vacuum();

  function set(id, value){
    var ele = document.getElementById(id);
    if (ele) { ele.innerText = value; }
  }

  this.spiders = new Spiders(this.nodes, function(stats){
    for (var p in stats){
      if (stats.hasOwnProperty(p)){
        set(p, stats[p]);
      }
    }
  });
};

Manager.prototype.update = function(){
  
  this.cursor.update();

  window.blowing = this.cursor.blowing;

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
};

Manager.prototype.draw = function(viewCtx, worldCtx, vacuumCtx){
  var s = config.size;

  viewCtx.clearRect(0, 0, s.x, s.y);
  worldCtx.clearRect(0, 0, s.x, s.y);

  this.cursor.draw(viewCtx);
  this.nodes.draw(worldCtx);
  this.spiders.draw(worldCtx);
  this.target.draw(worldCtx);
  
  this.vacuum.draw(vacuumCtx);
};