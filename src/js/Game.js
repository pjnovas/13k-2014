
$.Game = $.Base.extend({

  viewCtx:  null,
  worldCtx:  null,
  vacuumCtx:  null,

  tLoop:  null,
  paused:  false,

  start: function(options){
    this.cview = options.viewport;
    this.cworld = options.world;
    this.cvacuum = options.vacuum;
    this.cmodals = options.modals;

    this.boundGameRun = this.gameRun.bind(this);
    this.initContexts();

    this.manager = new $.Manager();

    this.mainModal = new $.Modal({
      ctx: this.modalsCtx,
      type: "main",
      onExit: this.play.bind(this)
    });

    this.mainModal.show();
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
    if (Time.tick()) { this.loop(); }
    this.tLoop = window.requestAnimationFrame(this.boundGameRun);
  },

  onWin: function(cb){
    this._onWin = cb;
  },

  onLoose: function(cb){
    this._onLoose = cb;
  }

});
