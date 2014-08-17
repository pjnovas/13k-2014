/*jslint -W083 */

var Node = require("./Node")
  , Paths = require("./Paths");

var Nodes = module.exports = function(){

  this.nodes = [];
  this.paths = new Paths();

  var radius = Vector.multiply(Vector.one, config.size.y/2 - 10);
  //var radius = Vector.divide(config.size, 2);
  var center = Vector.center(Vector.zero, config.size);

  this.createWeb(center, radius);

  this.applyPos = null;
  this.applyRatio = 0;
  this.element = null;

};

Nodes.prototype.createWeb = function(center, rad){

  var ringsAm = 0
    , ringsGap = 25
    , rndRadius = ringsGap/5
    , nodesByRing = 40
    , boundMin = Vector.add(center, Vector.multiply(rad, -1))
    , boundMax = Vector.add(center, rad)
    , rings = [];
 
  //var cNode = new Node(center);
  //this.nodes.push(cNode);

  var start = 40;
  var i = 1;
  var aNodeInside;

  var countNodes = 0;

  do {
    aNodeInside = false;

    var ps = Mathf.polygonPoints(center, (i*ringsGap) + start, nodesByRing);
    countNodes += ps.length;
    var cRing = [];

    if (i === 10 || i === 20){
      rndRadius += 0.1;
    }

    ps.forEach(function(p){

      var np = Vector.round(Vector.add(p, Mathf.rndInCircle(rndRadius)));
      var node = new Node(np);
      
      if (Vector.isOut(np, boundMin, boundMax)) {
        node.out = true;
      }
      else {
        aNodeInside = true;
        this.nodes.push(node);
      }
      
      cRing.push(node);

    }, this);

    rings[i-1] = cRing;
    i++;

  } while(aNodeInside);

  ringsAm = i-2;

  /*
  // path from center to first ring
  rings[0].forEach(function(rNode){
    if (Mathf.rnd01() < 0.4){
      this.paths.addOne(cNode, rNode);
    }
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
      if (currNode.out){
        continue;
      }

      var rSibling = rings[j+1][l];
      if (j < ringsAm-1 && !rSibling.out){
        this.paths.addOne(currNode, rSibling);
      }

      var sibling = rings[j][k];
      if (!sibling.out){
        this.paths.addOne(currNode, sibling);
      }
    }
  }

  // burn some nodes randomly
  this.nodes.forEach(function(node){
    node.randomBurn();
  });

  // sort a target node
  var sorted = false;
  var len = this.nodes.length-1;
  while(!sorted) {

    var idx = Mathf.rnd(0, len);
    var node = this.nodes[idx];

    if (!node.burned){
      node.target = true;
      sorted = true;
    }
  }

};

Nodes.prototype.findNodeByCollider = function(){
  
  this.nodes.forEach(function (node) {
    if (this.applyPos && Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
      //TODO: break each when found one and 
      // add a timer so it won't get busy appling the same several times
      switch(this.element){
        case "fire":
          node.burn();
          break;
        case "water":
          node.cool();
          break;
        case "earth":
          node.applyEarth();
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