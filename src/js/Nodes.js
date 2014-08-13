
var Node = require("./Node");

var Nodes = module.exports = function(opts){

  this.rows = opts.rows;
  this.cols = opts.cols;
  this.nodeSize = opts.nodeSize;

  this.nodeGrid = [];
//  this.gridCellsDebug = [];

  this.createGrid();

  this.paths = [];
  this.createPaths();
};

Nodes.prototype.createGrid = function(){
  var size = this.nodeSize;
  var gsize = config.size;

  var cw = gsize.x/this.cols;
  var ch = gsize.y/this.rows;
  var rndR = ch/2;

  for (var i=0; i<this.rows; i++){
    var col = [];

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
        col.push(null);

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
      var point = Mathf.randomInCircle(rndR);
      var center = Vector.getRectCenter({ x: cw*j, y: ch*i }, { x: cw, y: ch });
      
      var pos = Vector.add(center, point);

      var cell = new Node({
        pos: pos,
        size: size
      });

      col.push(cell);
    }

    this.nodeGrid.push(col);
  }

};

Nodes.prototype.createPaths = function(){

  for (var i=0; i<this.nodeGrid.length; i++){
    var row = this.nodeGrid[i];

    for (var j=0; j<row.length; j++){
      var node = this.nodeGrid[i][j];

      if (node){
        this.findNearNodes(i, j, node);
      }
    }
  }

};

Nodes.prototype.findNearNodes = function(i, j, node){
  var paths = this.paths;

  function hasPath(a, b){
    for(var k=0; k<paths.length; k++){
      var pa = paths[k].a, pb = paths[k].b;
      if (
        (Vector.isEqual(a, pa) || Vector.isEqual(a, pb)) &&
        (Vector.isEqual(b, pa) || Vector.isEqual(b, pb))
      ) {
        return true;
      }
    }
    return false;
  }

  function addPath(nodeA, nodeB){
    if (nodeB && !hasPath(nodeA.pos, nodeB.pos)){
      
      paths.push({
        a: Vector.clone(nodeA.pos),
        b: Vector.clone(nodeB.pos)
      });
    }
  }

  //left - top
  if (i-1 >= 0 && j-1 >= 0){
    addPath(node, this.nodeGrid[i-1][j-1]);
  }

  //left - bottom
  if (i-1 >= 0 && j+1 <= this.cols-1){
    addPath(node, this.nodeGrid[i-1][j+1]);
  }

  //right - top
  if (i+1 <= this.rows-1 && j-1 >= 0){
    addPath(node, this.nodeGrid[i+1][j-1]);
  }

  //right - bottom
  if (i+1 <= this.rows-1 && j+1 <= this.cols-1){
    addPath(node, this.nodeGrid[i+1][j+1]);
  }

};

Nodes.prototype.update = function(){
  
};

Nodes.prototype.draw = function(ctx){
/*
  // for debug
  for (var k=0; k<this.gridCellsDebug.length; k++){
    var c = this.gridCellsDebug[k];
    Renderer.drawRect(ctx, c);

    if (c.color === "red"){
      Renderer.drawCircle(ctx, {
        pos: Vector.getRectCenter(c.pos, c.size),
        radius: c.size.y/2,
        color: "yellow"
      });
    }

    Renderer.drawCircle(ctx, {
      pos: Vector.getRectCenter(c.pos, c.size),
      radius: 3,
      color: "black"
    });
  }
*/

  for (var i=0; i<this.nodeGrid.length; i++){
    var row = this.nodeGrid[i];

    for (var j=0; j<row.length; j++){
      var node = this.nodeGrid[i][j];
      if (node) {
        node.draw(ctx);
      }
    }
  }

  for(var l=0; l<this.paths.length; l++){
    var pa = this.paths[l].a, pb = this.paths[l].b;

    Renderer.drawLine(ctx, {
      from: pa,
      to: pb,
      size: 2,
      color: "#fff"
    });
  }

};