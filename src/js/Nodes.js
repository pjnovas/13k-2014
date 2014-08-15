/*jslint -W083 */

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(/*opts*/){

  /*
  this.rows = opts.rows;
  this.cols = opts.cols;
  this.nodeSize = opts.nodeSize;
  */

  this.nodeSize = 3;
  this.nodes = [];
  this.paths = new Paths();

  this.createWeb();

  this.applyPos = null;
  this.applyRatio = 0;
  this.element = null;

};

Nodes.prototype.addControlNodes = function(min, max){
  var size = this.nodeSize
    , xMax = max.x
    , yMax = max.y
    , xMin = min.x
    , yMin = min.y
    /*, xMid = ((xMax - xMin) / 2) + xMin
    , yMid = ((yMax - yMin) / 2) + yMin*/;

  var ctrlNodes = [];
  
  // right-mid
  //ctrlNodes.push(new Node({ pos: { x: xMax, y: yMid }, size: size }));
  
  // bot-right
  ctrlNodes.push(new Node({ pos: { x: xMax, y: yMax }, size: size }));
  // bot-mid
  //ctrlNodes.push(new Node({ pos: { x: xMid, y: yMax }, size: size }));
  // bot-left
  ctrlNodes.push(new Node({ pos: { x: xMin, y: yMax }, size: size }));

  // left-mid
  //ctrlNodes.push(new Node({ pos: { x: xMin, y: yMid }, size: size }));

  // top-left
  ctrlNodes.push(new Node({ pos: { x: xMin, y: yMin }, size: size }));
  // top-mid
  //ctrlNodes.push(new Node({ pos: { x: xMid, y: yMin }, size: size }));
  // top-right
  ctrlNodes.push(new Node({ pos: { x: xMax, y: yMin }, size: size }));

  return ctrlNodes;
};

Nodes.prototype.createWeb = function(){
  var size = this.nodeSize
    , ringsAm = 11
    , ringsGap = 30
    , rndRadius = ringsGap/5
    , nodesByRing = 16
    , center = { x: config.size.x/2, y: config.size.y/2 }
    , rings = []
    , node
    , bigRad = (ringsGap * (ringsAm-1)) + 50;

  var ctrlNodes = this.addControlNodes({ 
    x: center.x - bigRad,
    y: center.y - bigRad
  }, {
    x: center.x + bigRad,
    y: center.y + bigRad
  });

  this.nodes = this.nodes.concat(this.nodes, ctrlNodes);

  /*
  var cNode = new Node({
    pos: center,
    size: size
  });

  this.nodes.push(cNode);
  */

  for (var i=1; i<=ringsAm; i++){

    var ps = Mathf.polygonPoints(center, i*ringsGap, nodesByRing);

    var cRing = [];

    ps.forEach(function(p){

      node = new Node({
        pos: Vector.round(Vector.add(p, Mathf.rndInCircle(rndRadius))),
        size: size
      });

      this.nodes.push(node);
      cRing.push(node);  

    }, this);

    rings[i-1] = cRing;
  }

  // path from center to first ring
  /*
  rings[0].forEach(function(rNode){
    this.paths.addOne(cNode, rNode);
  }, this);
  */

  var j, k, l;

  // Paths connections between rings
  for (j=0; j<ringsAm-1; j++){
    var currRing = rings[j];
    var max = currRing.length;

    for (k=0; k<max; k++){

      l = k+1;
      if (l > max-1){
        l = 0;
      }

      var currNode = rings[j][l];
      this.paths.addOne(currNode, rings[j+1][l]);
    }
  }

  // Circle paths for each ring
  rings.forEach(function(rNodes){
    var max = rNodes.length;
    for (j=0; j<max;j++){
      k = j+1;
      if (k > max-1){
        k = 0;
      }

      this.paths.addOne(rNodes[j], rNodes[k]);
    }
  }, this);


  // last ring paths to ControlNodes
  var lastRing = rings[ringsAm-1];
  var m = 0;
  
  ctrlNodes.forEach(function(ctrlNode){
    for(k=m; k<=m+4; k++){
      this.paths.addOne(ctrlNode, lastRing[k]);
    }
    m+=4;
  }, this);

  this.paths.addOne(ctrlNodes[ctrlNodes.length-1], lastRing[0]);

};

Nodes.prototype.findNodeByCollider = function(pos, size, type){
  
  this.nodes.forEach(function (node) {
    if (Vector.pointInCircle(pos, node.pos, size)) {
      switch(type){
        case "fire":
          node.burn();
          break;
        case "water":
          node.cool();
          break;
      }
    }
  });

};

Nodes.prototype.GetNodes = function(){
  return this.nodes;
};

Nodes.prototype.update = function(){

  if (this.applyPos){
    this.findNodeByCollider(this.applyPos, this.applyRatio, this.element);
  }

  this.paths.update();

  this.nodes.forEach(function (node) {
    node.update();
  });

};

Nodes.prototype.draw = function(ctx){

  this.paths.draw(ctx);

  this.nodes.forEach(function (node) {
    node.draw(ctx);
  });

};