
module.exports = (function(){
  var resources = {}
    , loaded = 0
    , getCount = function(){
        return Object.keys(resources).length;
      };
  
  var events = {
      complete: function(){}
    , report: function(){}
    , error: function(){}
  };

  var imageLoaded = function() {
    var current = getCount();
    var prg = (++loaded * 100) / current;

    if (loaded <= current){
      events.report(prg);

      if (prg >= 100) { 
        events.complete();
      }
    }
  };
  
  var imageFailed = function(evt, etc){
    events.error(evt, etc);       
  };

  return {
    on: function(eventName, callback){
      if (events[eventName]) {
        events[eventName] = callback;
      }
      return this;
    },
    
    load: function(){
      loaded = 0;
      for (var img in resources) {
        if (resources.hasOwnProperty(img)){
          this[img] = new window.Image();
          this[img].onload = imageLoaded;
          this[img].onerror = imageFailed;
          this[img].src = resources[img];
        }
      }
      return this;
    },
    
    addResources: function(newResources){
      for(var r in newResources){
        if (newResources.hasOwnProperty(r)){
          if (resources.hasOwnProperty(r)) {
            throw 'The resource ' + r + ' already exists.';
          }
          resources[r] = newResources[r];
        }
      }
      return this;
    }
    
  };
  
})();