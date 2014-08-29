
$.Controls = $.Base.extend({

  events: {
      "pressing": null
    , "moving": null
    , "release": null
    , "element": null
    , "pause": null
  },

  enabled: false,

  start: function(options){
    var doc = window.document
      , c = this.container = options.container || doc;

    c.onmouseup = this._onMouseEvent.bind(this, "release");
    c.onmousedown = this._onMouseEvent.bind(this, "pressing");
    c.onmousemove = this._onMouseEvent.bind(this, "moving");
    doc.addEventListener("keyup", this._onKeyUp.bind(this));
  },

  enable: function(){
    this.enabled = true;
    return this;
  },

  disable: function(){
    this.enabled = false;
    return this;
  },

  on: function(evName, callback){
    if (!this.events[evName]){
      this.events[evName] = [];
    }

    this.events[evName].push(callback);

    return this;
  },

  off: function(evName){
    if (this.events[evName]){
      this.events[evName].length = 0;
    }

    return this;
  },

  _getEventName: function(e){
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
  },

  _onKeyUp: function(e){
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
  },

  _onMouseEvent: function(type, e){
    if (!this.enabled){
      return;
    }

    var pos = this.getCoordsEvent(e, this.container);

    this.events[type].forEach(function(cb){
      cb(pos);
    });
  },

  getCoordsEvent: function(e, ele){
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
    
    x -= ele.offsetLeft;
    y -= ele.offsetTop;
    
    return { x: x, y: y };
  }

});
