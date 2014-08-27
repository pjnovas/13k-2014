
var Target = module.exports = function(){

  this.size = config.size.y/6; // config.target.size;
  this.suckForce = config.target.suckForce;

  var marginW = config.world.margin.x;
  var marginH = config.world.margin.y;

  this.pos = Vector.prod(Vector.one, config.size);
  this.pos.x -= marginW + 10;
  this.pos.y -= marginH + 20;
  
  this.saved = [];
  this.saving = [];
};

Target.prototype.setNodesInside = function(nodes){
  nodes.forEach(function(node){
    if (Vector.pointInCircle(node.pos, this.pos, this.size)){
      if (node.burned){
        node.burned = false;
        node.revive();
      }
      node.insideTarget = true;
    }
  }, this);
};

Target.prototype.update = function(spiders){

  spiders.forEach(function(spider){
    if (!spider.dead && !spider.exited){

      if (Vector.pointInCircle(spider.pos, this.pos, this.size)){
        spider.building = false;
        spider.exited = true;
        spider.vel = { x: 0, y: 0 };
        this.saving.push(spider);
      }
    }
  }, this);

  var dt = Time.deltaTime
    , force = dt * this.suckForce
    , p = this.pos;

  this.saving.forEach(function(spider){

    if (!spider.catched){
      var sp = spider.pos;
      var imp = Vector.normal(sp, p);
      spider.vel = Vector.add(spider.vel, Vector.multiply(imp, force)); 
      spider.pos = Vector.add(sp, spider.vel);
      
      if (Vector.pointInCircle(spider.pos, p, 5)){
        spider.catched = true;
        this.saved.push(spider);
      }
    }

  }, this); 

};

Target.prototype.draw = function(ctx){
 
  var startAngle = 0.97 * Math.PI;
  var endAngle = 1.52 * Math.PI;

  ctx.beginPath();
  ctx.lineCap = 'butt';
  ctx.arc(this.pos.x, this.pos.y, this.size/2, startAngle, endAngle, false);
  ctx.lineWidth = this.size;
  ctx.strokeStyle = "rgba(80,255,85,0.1)";
  ctx.stroke();

};