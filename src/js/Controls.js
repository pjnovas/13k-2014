
var Desktop = module.exports = function(options){
  var c = this.container = options.container || window.document;

  this.events = {
      "pressing": null
    , "moving": null
    , "release": null
    , "element": null
    , "pause": null
  };

  this.enabled = false;

  c.onmouseup = this._onMouseEvent.bind(this, "release");
  c.onmousedown = this._onMouseEvent.bind(this, "pressing");
  c.onmousemove = this._onMouseEvent.bind(this, "moving");
  window.document.onkeyup = this._onKeyUp.bind(this);
};

Desktop.prototype.enable = function(){
  this.enabled = true;
  return this;
};

Desktop.prototype.disable = function(){
  this.enabled = false;
  return this;
};

Desktop.prototype.on = function(evName, callback){
  if (!this.events[evName]){
    this.events[evName] = [];
  }

  this.events[evName].push(callback);

  return this;
};

Desktop.prototype.off = function(evName){
  if (this.events[evName]){
    this.events[evName].length = 0;
  }

  return this;
};

function getCoordsEvent(e, canvas){
  var x, y
    , doc = document
    , body = doc.body
    , docEle = doc.documentElement;

  if (e.pageX || e.pageY) { 
    x = e.pageX;
    y = e.pageY;
  }
  else { 
    x = e.clientX + body.scrollLeft + docEle.scrollLeft; 
    y = e.clientY + body.scrollTop + docEle.scrollTop; 
  } 
  
  x -= canvas.offsetLeft;
  y -= canvas.offsetTop;
  
  return { x: x, y: y };
}

Desktop.prototype._getEventName = function(e){
  switch(e.which || e.keyCode){
    case 81: //Q
    case 113: //q
      return "element:fire";
    case 87: //W
    case 119: //w
      return "element:water";
    case 69: //E
    case 101: //e
      return "element:earth";
    case 82: //R
    case 114: //r
      return "element:air";
    case 112: //P
    case 80: //p
      return "pause";
  }

  return;
};

Desktop.prototype._onKeyUp = function(e){
  var evName = this._getEventName(e);

  if (!this.enabled && evName !== "pause"){
    return;
  }

  if (evName){

    if (evName.indexOf("element") > -1){
      var element = evName.split(":")[1];
      this.events.element.forEach(function(cb){
        cb(element);
      });

      return;
    }

    this.events[evName].forEach(function(cb){
      cb();
    });
  }
};

Desktop.prototype._onMouseEvent = function(type, e){
  if (!this.enabled){
    return;
  }

  var pos = getCoordsEvent(e, this.container);

  this.events[type].forEach(function(cb){
    cb(pos);
  });
};
