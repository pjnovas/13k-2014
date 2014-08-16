
var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};
