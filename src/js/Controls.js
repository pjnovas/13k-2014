
var Mouse = module.exports = function(options){
  this.container = options.container || window.document;

  this.events = {
      "pressed": null
  };

  this.enabled = false;

  this.onMouseUp = this._onMouseUp.bind(this);
  this.container.onmouseup = this.onMouseUp;
};

Mouse.prototype.enable = function(){
  this.enabled = true;
  return this;
};

Mouse.prototype.disable = function(){
  this.enabled = false;
  return this;
};

Mouse.prototype.on = function(evName, callback){
  if (!this.events[evName]){
    this.events[evName] = [];
  }

  this.events[evName].push(callback);

  return this;
};

Mouse.prototype.off = function(evName){
  if (this.events[evName]){
    this.events[evName].length = 0;
  }

  return this;
};

function getCoordsEvent(e, canvas){
  var x, y;

  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  }
  else { 
    x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft; 
    y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop; 
  } 
  
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  
  return { x: x, y: y };
}

Mouse.prototype._onMouseUp = function(e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events.pressed.forEach(function(cb){
    cb(pos);
  });
};