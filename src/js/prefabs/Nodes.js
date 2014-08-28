/*jslint -W083 */

$.Nodes = $.Collection.extend({

  paths: null,

  applyPos: null,
  applyRatio: 0,
  element: null,

  start: function(){
    this.paths = new $.Paths();

    var marginW = config.world.margin.x;
    var marginH = config.world.margin.y;
    
    // Full-screen
    var radius = $.Vector.divide(config.size, 2);

    // Full-screen with margin
    radius.x -= marginW;
    radius.y -= marginH;

    // Center of Screen
    var center = $.Vector.center($.Vector.zero, config.size);

    this.createWeb(center, radius);
  },

  createWeb: function(center, rad){

    var ringsAm = 0
      , ringsGap = 30
      , rndRadius = ringsGap/5
      , nodesByRing = 6
      , duplicateBy = 3
      , increaseBy = 2
      , maxNodesByRing = nodesByRing * 8 // 8 times increase max
      , boundMin = $.Vector.add(center, $.Vector.multiply(rad, -1))
      , boundMax = $.Vector.add(center, rad)
      , rings = [];
   
    var cNode = new $.Node({ pos: center });
    this.entities.push(cNode);

    var start = 10;
    var i = 1;
    var aNodeInside;

    var countNodes = 0;

    do {
      aNodeInside = false;

      if (i % duplicateBy === 0){
        nodesByRing *= increaseBy;
      }
      if (nodesByRing > maxNodesByRing){
        nodesByRing = maxNodesByRing;
      }

      var ps = $.Mathf.polygonPoints(center, (i*ringsGap) + start, nodesByRing);
      countNodes += ps.length;
      var cRing = [];

      if (i === 10 || i === 20){
        rndRadius += 0.1;
      }

      ps.forEach(function(p){

        var np = $.Vector.round($.Vector.add(p, $.Mathf.rndInCircle(rndRadius)));
        var node = new $.Node({ pos: np });
        
        if ($.Vector.isOut(np, boundMin, boundMax)) {
          node.out = true;
        }
        else {
          aNodeInside = true;
          this.entities.push(node);
        }
        
        cRing.push(node);

      }, this);

      rings[i-1] = cRing;
      i++;

    } while(aNodeInside);

    ringsAm = i-2;

    
    // path from center to first ring
    rings[0].forEach(function(rNode){
      this.paths.addOne(cNode, rNode);
    }, this);

    var j, k, l1, l2;

    // Paths connections between rings
    for (j=0; j<ringsAm; j++){
      var currRing = rings[j];
      var max = currRing.length;

      for (k=0; k<max; k++){

        l1 = k+1;
        l2 = k*increaseBy;
        if (l1 > max-1){
          l1 = 0;
        }

        if (l2 > (max*increaseBy)-duplicateBy){
          l2 = -increaseBy;
        }

        var currNode = rings[j][l1];
        if (currNode.out){
          continue;
        }

        var nextRing = rings[j+1];
        var rSiblingA = nextRing[l1];

        if (nextRing.length > currRing.length) {
           rSiblingA = nextRing[l2+increaseBy]; 
        }
        
        if (j < ringsAm-1){
          if (rSiblingA && !rSiblingA.out){
            this.paths.addOne(currNode, rSiblingA);
          }
        }

        var sibling = rings[j][k];
        if (!sibling.out){
          this.paths.addOne(currNode, sibling);
        }

      }
    }

    // burn some nodes randomly
    this.entities.forEach(function(node){
      node.randomBurn();
    });

  },

  elements: ["fire", "water", "earth", "air"],
  applyMethods: ["burn", "cool", "applyEarth", "applyAir"],

  findNodeByCollider: function(){
    this.entities.forEach(function (node) {
      if (this.applyPos && $.Vector.pointInCircle(this.applyPos, node.pos, this.applyRatio)) {
        var methodIdx = this.elements.indexOf(this.element);
        var method = this.applyMethods[methodIdx];
        node[method]();
      }
    }, this);
  },

  getNodes: function(){
    return this.entities;
  },

  update: function(){

    if (this.applyPos){
      this.findNodeByCollider();
    }

    this.paths.update();
    $.Nodes._super.update.apply(this);
  },

  draw: function(ctx){
    this.paths.draw(ctx);
    $.Nodes._super.draw.apply(this, arguments);
  }

});
