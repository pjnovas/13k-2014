
var Utils = module.exports = function(){
  this.lastIds = {
    nodes: 0,
    spiders: 0,
    emitters: 0
  };
};

Utils.prototype.guid = function(type){
  return ++this.lastIds[type];
};

Utils.prototype.pad = function(num, size) {
  var s = "0000000" + num;
  return s.substr(s.length-size);
};
