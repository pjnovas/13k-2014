/*jslint -W083 */

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(){

  this.nodes = [];
  this.paths = new Paths();

  this.createWeb(config.size);

  this.applyPos = null;
  this.applyRatio = 0;
  this.element = null;

};

Nodes.prototype.addControlNodes = function(min, max/*, rndRadius*/){
  var /*rnd = rndRadius*5
    , */xMax = max.x
    , yMax = max.y
    , xMin = min.x
    , yMin = min.y
    /*, xMid = ((xMax - xMin) / 2) + xMin
    , yMid = ((yMax - yMin) / 2) + yMin*/;

  var ctrlNodes = [];
  
  function add(p){
    var newp = Vector.round(p/*Vector.add(p, Mathf.rndInCircle(rnd))*/);
    ctrlNodes.push(new Node(newp));  
  }

  // right-mid
  //add({ x: xMax, y: yMid });
  
  // bot-right
  add({ x: xMax, y: yMax });
  
  // bot-mid
  //add({ x: xMid, y: yMax );
  
  // bot-left
  add({ x: xMin, y: yMax });

  // left-mid
  //add({ x: xMin, y: yMid });

  // top-left
  add({ x: xMin, y: yMin });
  
  // top-mid
  //add({ x: xMid, y: yMin });
  
  // top-right
  add({ x: xMax, y: yMin });

  return ctrlNodes;
};

Nodes.prototype.createWeb = function(bounds){

  var ringsAm = Math.round(bounds.y / 100) + 2
    , ringsGap = Math.round(ringsAm * 2.5)
    , rndRadius = ringsGap/5
    , nodesByRing = 16
    , center = { x: bounds.x/2, y: bounds.y/2 }
    , rings = []
    , bigRad = (ringsGap * (ringsAm-1)) + (ringsGap * 3);

  var ctrlNodes = this.addControlNodes({ 
    x: center.x - bigRad,
    y: center.y - bigRad
  }, {
    x: center.x + bigRad,
    y: center.y + bigRad
  }, rndRadius);

  this.nodes = this.nodes.concat(this.nodes, ctrlNodes);

  /*
  var cNode = new Node(center);
  this.nodes.push(cNode);
  */

  for (var i=1; i<=ringsAm; i++){

    var ps = Mathf.polygonPoints(center, i*ringsGap, nodesByRing);

    var cRing = [];

    ps.forEach(function(p){

      var node = new Node(
        Vector.round(Vector.add(p, Mathf.rndInCircle(rndRadius)))
      );

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
  for (j=0; j<ringsAm; j++){
    var currRing = rings[j];
    var max = currRing.length;

    for (k=0; k<max; k++){

      l = k+1;
      if (l > max-1){
        l = 0;
      }

      var currNode = rings[j][l];
      if (j < ringsAm-1){
        this.paths.addOne(currNode, rings[j+1][l]);
      }

      // Circle paths for each ring
      this.paths.addOne(currNode, rings[j][k]);
    }
  }

  // TODO: Refactor this crap code
  // last 3 rings paths to ControlNodes
  var lRing = rings[ringsAm-1]
    , plRing = rings[ringsAm-2]
    , pplRing = rings[ringsAm-3]
    , m = 1;

  function getPos(from, to, delta){
    var p = Vector.part(from.pos, to.pos, delta);
    return Vector.round(Vector.add(p, Mathf.rndInCircle(rndRadius*2)));
  }
  
  ctrlNodes.forEach(function(ctrlNode){
    for(k=m; k<=m+2; k++){

      var pprend = pplRing[k]
        , prend = plRing[k]
        , lastnd = lRing[k];

      if (k % 2 === 0) {
        lastnd.pos = getPos(ctrlNode, lastnd, 7);
        prend.pos = getPos(lastnd, prend, 5);
        pprend.pos = getPos(lastnd, pprend, 8);
      }
      else {
        lastnd.pos = getPos(ctrlNode, lastnd, 5);
        prend.pos = getPos(lastnd, prend, 8);
      }

      this.paths.addOne(ctrlNode, lastnd);
    }

    m+=4;
  }, this);

  // clean memory
  rings.length = 0;
  ctrlNodes.length = 0;

  lRing = null;
  plRing = null;
  pplRing = null;
};

Nodes.prototype.findNodeByCollider = function(){
  
  this.nodes.forEach(function (node) {
    if (Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
      //TODO: break each when found one and 
      // add a timer so it won't get busy appling the same several times
      switch(this.element){
        case "fire":
          node.burn();
          break;
        case "water":
          node.cool();
          break;
      }
    }
  }, this);

};

Nodes.prototype.GetNodes = function(){
  return this.nodes;
};

Nodes.prototype.update = function(){

  if (this.applyPos){
    this.findNodeByCollider();
  }

  this.paths.update();

  this.nodes.forEach(function (node) {
    if (!node.burned){
      node.update();
    }
  });

};

Nodes.prototype.draw = function(ctx){

  this.paths.draw(ctx);

  this.nodes.forEach(function (node) {
    node.draw(ctx);
  });

};