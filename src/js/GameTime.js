
$.GameTime = $.Base.extend({

  lastTime: null,
  frameTime: 0,
  deltaTime: 0,
  typicalFrameTime: 20,
  minFrameTime: 12,
  time: 0,

  start: function(){
    this.lastTime = Date.now();

    $.tm = this.time;
    $.dt = this.deltaTime;
    $.ft = this.frameTime;
  },

  tick: function(){
    var now = Date.now();
    var delta = now - this.lastTime;

    if (delta < this.minFrameTime ) {
      return false;
    }

    if (delta > 2 * this.typicalFrameTime) { // +1 frame if too much time elapsed
      $.ft = this.typicalFrameTime;
    } else {  
      $.ft = delta;      
    }

    this.frameTime = $.ft;
    $.dt = $.ft/1000;

    this.time += $.ft;
    $.tm = this.time;
    
    this.lastTime = now;

    return true;
  }

});
