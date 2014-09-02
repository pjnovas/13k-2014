
$.Spiders = $.Collection.extend({

  spidersExit: 0,
  spidersKilled: 0,
  stats: {},
  amount: 0,

  applyPos: null,
  applyRatio: 0,
  element: null,

  start: function(){
    this.entities = [];

    this.generateSpiders();
    this.updateGUI();
  },

  updateGUI: function(){
    this.stats = {
      saved: this.spidersExit,
      killed: this.spidersKilled,
      alives: this.entities.length - (this.spidersKilled + this.spidersExit),
      total: this.entities.length
    };
  },

  onSpiderDead: function(){
    this.spidersKilled++;
    this.updateGUI();
  },

  generateSpiders: function(){
    var nodes = this.nodes.getNodes()
      , len = nodes.length
      , nodesIds = []
      , node
      , idx
      , amount = (len < this.amount ? len-2: this.amount);

    do {
      idx = $.M.rnd(0, len-1);
      node = nodes[idx];

      if (!node.burned && nodesIds.indexOf(node.cid) === -1){
        nodesIds.push(node.cid);
        
        this.entities.push(new $.Spider({
          pos: node.pos, 
          onDead: this.onSpiderDead.bind(this)
        }));

        amount--;
      }
    } while(amount);
  },

  getSpiders: function(){
    return this.entities;
  },

  gonnaBuildWeb: function(node, spider){
    if (!node.hasEarth && !node.temp && $.M.rnd01() > 0.7) {
      var nearBurned = node.getNearBurned();
      if (nearBurned){
        spider.buildWeb(node, nearBurned);
        return true;
      }
    }

    return false;
  },

  gotNearNodeToGo: function(node, spider){
    var fromId = (spider.nodeFrom && spider.nodeFrom.cid) || -1;
    var nodeTo = node.getRandomNear(fromId);
    if (nodeTo){
      spider.setNode(node, nodeTo);
      return true;
    }

    return false;
  },

  spiderNodeCollide: function(spider, node){
    if ($.V.pointInCircle(spider.pos, node.pos, 5)) {
     
      if (!this.gonnaBuildWeb(node, spider) && !this.gotNearNodeToGo(node, spider)){
        if (node.burned){
          spider.setDead();
        }
      }
    }
  },

  findSpidersByCollider: function(){
    this.entities.forEach(function (spider) {
      if ($.V.pointInCircle(this.applyPos, spider.pos, this.applyRatio)) {
        spider[config.methods[config.elements.indexOf(this.element)]]();
      }
    }, this);
  },

  update: function(){

    if (this.applyPos && this.element === "fire"){
      // only interact with fire so far
      this.findSpidersByCollider();
    }
    
    var nodes = this.nodes.getNodes();

    var lastExits = this.spidersExit;
    this.spidersExit = 0;
    this.entities.forEach(function (spider) {

      if (spider.exited){
        this.spidersExit++;
      }
      else if (spider.canMove()){
        nodes.some(function (node) {
          this.spiderNodeCollide(spider, node);
        }, this);
      }
    
      spider.update();

    }, this);

    if (lastExits !== this.spidersExit){
      this.updateGUI();
    }
  },

  draw: function(ctx){
    this.entities.forEach(function (spider) {
      if (!spider.inVacuum){
        spider.draw(ctx);
      }
    });
  }

});
