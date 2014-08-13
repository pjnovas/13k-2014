
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

      this.nodeGrid[i][j] = new Node({
        pos: Vector.add(center, point),
        size: size
      });
    }
  }

};

Nodes.prototype.createPaths = function(){

  this.nodeGrid.forEach(function (row, i) {
    row.forEach(function (node, j) {
      if (node) {
        this.findNearNodes(i, j, node);
      }
    }, this);
  }, this);

};

Nodes.prototype.findNearNodes = function(i, j, node){
  var paths = this.paths
    , rows = this.rows
    , cols = this.cols;

  function hasPath(a, b){
    return paths.some(function(path){
      var pa = path.a, pb = path.b;

      return (
        (Vector.eql(a, pa) || Vector.eql(a, pb)) &&
        (Vector.eql(b, pa) || Vector.eql(b, pb))
      );
    });
  }

  function addPath(nA, nB){
    if (nB && !hasPath(nA.pos, nB.pos)){
      paths.push({
        a: Vector.clone(nA.pos),
        b: Vector.clone(nB.pos)
      });
    }
  }

  [ [-1,-1], [1,1], [-1,1], [1,-1] ].forEach(function (box) {
    var x = i + box[0]
      , y = j + box[1];
    
    if (x >= 0 && x <= rows-1 && y >= 0 && y <= cols-1){
      addPath(node, this.nodeGrid[x][y]);
    }
  }, this);

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

  this.nodeGrid.forEach(function (row) {
    row.forEach(function (node) {
      if (node) {
        node.draw(ctx);
      }
    });
  });

  this.paths.forEach(function (path) {
    Renderer.drawLine(ctx, {
      from: path.a,
      to: path.b,
      size: 2,
      color: "#fff"
    });
  });

};