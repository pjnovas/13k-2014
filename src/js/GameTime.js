
module.exports = psycho.Base.extend({

  lastTime: null,
  frameTime: 0,
  deltaTime: 0,
  typicalFrameTime: 20,
  minFrameTime: 12,
  time: 0,

  initialize: function(){
    this.lastTime = Date.now();
  },

  tick: function(){
    var now = Date.now();
    var delta = now - this.lastTime;

    if (delta < this.minFrameTime ) {
      return false;
    }

    if (delta > 2 * this.typicalFrameTime) { // +1 frame if too much time elapsed
      this.frameTime = this.typicalFrameTime;
    } else {  
      this.frameTime = delta;      
    }

    this.deltaTime = this.frameTime/1000;
    this.time += this.frameTime;
    this.lastTime = now;

    return true;
  }

});

/*
GameTime.prototype.reset = function() {
  this.lastTime = Date.now();
  this.frameTime = 0;
  this.deltaTime = 0;
  this.typicalFrameTime = 20;
  this.minFrameTime = 12; 
  this.time = 0;
};
*/