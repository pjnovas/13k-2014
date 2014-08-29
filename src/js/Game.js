
$.Game = $.Base.extend({

  tLoop:  null,
  paused:  false,

  start: function(){
    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();

    this.started = false;

    var self = this;

    this.levelModal = new $.Modal({
      ctx: this.modalsCtx,
      type: "level",
      onExit: function(){
        self.createManager();
        
        self.started = true;
        self.play();
      }
    });

    this.mainModal = new $.Modal({
      ctx: this.modalsCtx,
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

    this.mainModal.show();
  },

  createManager: function(){
    this.manager = null;
    this.manager = new $.Manager({
      onEnd: this._endGame.bind(this),
      level: this.levelModal.levelIndex
    });
  },

  _endGame: function(stats, won){
    console.log("END GAME!! > YOU " + ( won ? "WIN!" : "LOOSE!" ) );
    console.log("Collected: " + stats.saved + " || Kills: " + stats.killed);

    this.stop();
  },

  initContexts: function(){
    var size = config.size
      , vsize = config.vacuum.size;

    function getContext(canvas, _size){
      canvas.width = _size.x;
      canvas.height = _size.y;
      return canvas.getContext("2d");
    }

    this.viewCtx = getContext(this.cview, size);
    this.worldCtx = getContext(this.cworld, size);
    this.vacuumCtx = getContext(this.cvacuum, vsize);
    this.modalsCtx = getContext(this.cmodals, size);
  },

  loop: function(){
    //console.log(Time.frameTime + "( " + Time.deltaTime + " ) / " + Time.time);
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
