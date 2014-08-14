
var Node = module.exports = function(opts){
  this.id = Utils.guid("nodes");

  this.row = opts.row;
  this.col = opts.col;

  this.pos = opts.pos;
  this.size = opts.size;
  this.color = "#fff";

  this.nears = [];
  this.selected = false;
};

Node.prototype.addNear = function(node){
  this.nears.push(node);
};

Node.prototype.select = function(){
  var selected = !this.selected;
  this.selected = selected;

  this.nears.forEach(function (node){
    node.selected = selected;
  });
};

Node.prototype.update = function(){
  this.color = "#fff";

  if (this.selected){
    this.color = "red";
  }
};

Node.prototype.draw = function(ctx){

  Renderer.drawCircle(ctx, {
    pos: this.pos,
    radius: this.size,
    color: this.color
  });

};