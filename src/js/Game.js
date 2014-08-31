
$.Game = $.Base.extend({

  tLoop:  null,
  paused:  false,

  start: function(){
    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();

    this.started = false;

    var self = this;
    var mctx = this.modalsCtx;

    this.levelModal = new $.Modal({
      ctx: mctx,
      type: "level",
      onExit: function(){
        self.createManager();
        
        self.started = true;
        self.play();
      }
    });

    this.mainModal = new $.Modal({
      ctx: mctx,
      type: "main",
      onExit: function(){
        if (self.started){
          self.play();
        }
        else {
          self.levelModal.show();
        }
      }
    });

    this.endModal = new $.Modal({
      ctx: mctx,
      type: "end"
    });

    this.mainModal.show();
  },

  createManager: function(){
    this.manager = new $.Manager({
      onEnd: this._endGame.bind(this),
      level: this.levelModal.levelIndex
    });
  },

  _endGame: function(stats, won){
    var self = this;
    this.endModal.won = won;
    
    this.endModal._onExit = function(){
      if (won){
        self.levelModal.show();
      }
      else {
        self.createManager();
        self.play();
      }
    };

    this.endModal.show();
    this.stop();
  },

  initContexts: function(){
    var size = config.size
      , vsize = config.vacuum.size
      , i = 0;

    function getContext(canvas, _size){
      canvas.width = _size.x;
      canvas.height = _size.y;
      canvas.style.zIndex = ++i;
      return canvas.getContext("2d");
    }

    this.worldCtx = getContext(this.cworld, size);
    this.viewCtx = getContext(this.cview, size);
    this.vacuumCtx = getContext(this.cvacuum, vsize);
    this.modalsCtx = getContext(this.cmodals, size);
  },

  loop: function(){
    this.manager.update();
    this.manager.draw(this.viewCtx, this.worldCtx, this.vacuumCtx);
  },

  play: function(){
    this.paused = false;
    Controls.enable();
    this.gameRun();
  },

  stop: function(){
    this.paused = true;
    Controls.disable();
    window.cancelAnimationFrame(this.tLoop);
  },

  gameRun: function(){
    if (!this.paused){
      if (Time.tick()) { this.loop(); }
      this.tLoop = window.requestAnimationFrame(this.boundGameRun);
    }
  },

});
