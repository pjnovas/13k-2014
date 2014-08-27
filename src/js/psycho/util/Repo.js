
module.exports = (function(){
  var resources = {}
    , loaded = 0
    , getCount = function(){
        return Object.keys(resources).length;
      }
    , complete = function(){};

  var imageLoaded = function() {
    var current = getCount();
    var prg = (++loaded * 100) / current;

    if (loaded <= current && prg >= 100){
      complete();
    }
  };
  
  return {
    onComplete: function(callback){
      complete = callback;
      return this;
    },
    
    load: function(){
      loaded = 0;
      for (var img in resources) {
        this[img] = new window.Image();
        this[img].onload = imageLoaded;
        this[img].src = resources[img];
      }
      return this;
    },
    
    addResources: function(newResources){
      for(var r in newResources){
        resources[r] = newResources[r];
      }
      return this;
    }
    
  };
  
})();