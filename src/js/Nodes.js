
var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(opts){

  this.rows = opts.rows;
  this.cols = opts.cols;
  this.nodeSize = opts.nodeSize;

  this.nodes = [];
  this.nodeGrid = [];

//  this.gridCellsDebug = [];

  this.createGrid();

  this.paths = new Paths();
  this.createPaths();

  Controls.on("pressed", this.findNodeByCollider.bind(this));
};

Nodes.prototype.createGrid = function(){
  var size = this.nodeSize
    , gsize = config.size

    , cw = gsize.x/this.cols
    , ch = gsize.y/this.rows
    , rndR = ch/2;

  for (var i=0; i<this.rows; i++){
    this.nodeGrid[i] = [];

    for (var j=0; j<this.cols; j++){

      if ( (i % 2 === 0 && j % 2 === 0) || (i % 2 !== 0 && j % 2 !== 0) ){
/*
        //debug cell
        this.gridCellsDebug.push({
          pos: { x: cw*j, y: ch*i },
          size: { x: cw, y: ch },
          color: "silver"
        });
*/
        continue;
      }
/*
      //debug cell
      this.gridCellsDebug.push({
        pos: { x: cw*j, y: ch*i },
        size: { x: cw, y: ch },
        color: "red"
      });
*/
      var point = Mathf.rndInCircle(rndR);
      var center = Vector.center({ x: cw*j, y: ch*i }, { x: cw, y: ch });

      var node = new Node({
        pos: Vector.add(center, point),
        size: size,
        row: i,
        col: j
      });

      this.nodeGrid[i][j] = node;
      this.nodes.push(node);
    }
  }

};

Nodes.prototype.createPaths = function(){

  this.nodes.forEach(function (node) {
    this.findNearNodes(node.row, node.col, node);
  }, this);

};

Nodes.prototype.findNearNodes = function(i, j, node){
  var rows = this.rows
    , cols = this.cols;

  [ [-1,-1], [1,1], [-1,1], [1,-1] ].forEach(function (box) {
    var x = i + box[0]
      , y = j + box[1];
    
    if (x >= 0 && x <= rows-1 && y >= 0 && y <= cols-1){
      this.paths.addOne(node, this.nodeGrid[x][y]);
    }
  }, this);

};

Nodes.prototype.findNodeByCollider = function(pos){
  
  this.nodes.forEach(function (node) {
    if (Vector.pointInCircle(pos, node.pos, node.size)) {
      node.select();
    }
  });

};

Nodes.prototype.update = function(){
  this.paths.update();

  this.nodes.forEach(function (node) {
    node.update();
  });
};

Nodes.prototype.draw = function(ctx){
/*
  // for debug
  for (var k=0; k<this.gridCellsDebug.length; k++){
    var c = this.gridCellsDebug[k];
    Renderer.drawRect(ctx, c);

    if (c.color === "red"){
      Renderer.drawCircle(ctx, {
        pos: Vector.center(c.pos, c.size),
        radius: c.size.y/2,
        color: "yellow"
      });
    }

    Renderer.drawCircle(ctx, {
      pos: Vector.center(c.pos, c.size),
      radius: 3,
      color: "black"
    });
  }
*/

  this.paths.draw(ctx);

  this.nodes.forEach(function (node) {
    node.draw(ctx);
  });

};