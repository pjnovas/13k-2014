
$.Modal = $.Base.extend({

  start: function(options){
    this._onExit = options.onExit;

    this.modalItems = [];

    this.initBackDrop();
    this["init" + this.type]();

    document.addEventListener("keyup", this._onKeyUp.bind(this));
  },

  _onKeyUp: function(e){
    var curr = window.modal;
    if (curr !== this.type){
      return;
    }

    var idx = this.levelIndex;
    var key = (e.which || e.keyCode);

    if (key === 13){
      this.hide();
      this._onExit();
      return;
    }

    if (curr === "level"){
      idx = ( key === 40 ? idx+1 : (key === 38 ? idx-1 : idx));
      idx = ( idx < 0 ? 3 : ( idx > 3 ? 0 : idx ));
      
      this.levelIndex = idx;
      this.updateLevel();
    }
  },

  updateLevel: function(){
    if (this.levels){
      this.levels.forEach(function(lvl, i){
        lvl.color = (i === this.levelIndex ? "#00ff00" : "#fff");
      }, this);
    }

    this.redraw();
  },

  initBackDrop: function(){
    this.bg = new $.Rect({
      pos: { x: 0, y: 0},
      size: config.size,
      corner: 10,
      fill: [0,0,0,0.5]
    });
  },

  initPressKey: function(pos){
    var enter = {
      text: "-- PRESS ENTER --",
      pos: pos,
      size: 20,
      color: [0,255,0,1]
    };

    enter.pos.x += (enter.size*enter.text.length*1.1)/2;

    this.pressKey = new $.Text(enter);
  },

  createHolder: function(size, txt, center){
    var pos = $.V.center($.V.zero, config.size);
    pos.x -= size.x/2;
    pos.y -= size.y/2;

    var holder = new $.Rect({
      pos: pos,
      size: size,
      fill: [30,30,30,1],
      corner: 10,
      stroke: {
        size: 3,
        color: [255,255,255,1]
      }
    });

    var title = {
      text: txt,
      pos: $.V.center(pos, size),
      size: 20
    };

    title.pos.x -= (title.size*title.text.length*center)/2;
    title.pos.y = pos.y + title.size*2;

    var tlt = new $.Text(title);

    this.modalItems.push(holder);
    this.modalItems.push(tlt);

    return {
      holder: holder,
      title: tlt
    };
  },

  initmain: function(){ 
    var items = this.modalItems = [];

    var size = { x: 600, y: 550 };
    var holderCtn = this.createHolder(size, document.title, 0.8);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var sub = {
      text: "Use The Elements to lead spiders into the Vacuum!",
      pos: $.V.center(pos, size),
      size: 15,
    };

    sub.pos.x -= (sub.size*sub.text.length*0.6)/2;
    sub.pos.y = tltPos.y + sub.size*2.5 +10;

    items.push(new $.Text(sub));

    var elePos = { x: pos.x + 30, y: sub.pos.y + 35 };
    items.push(new $.Elements({
      pos: elePos,
      size: 66,
      gap: 15,
      showKeys: false
    }));

    var textsTlts = [
      "BURN",
      "COOL",
      "DIRTY",
      "BLOW"
    ];

    var textsDesc = [
      "Burn the web but watch to not burn Spiders!",
      "Fire propagates fast!, use the water to cool it",
      "Stops the fire and avoid spiders re-build the web",
      "Burn faster, annoy spiders and removes dirty"
    ];

    textsTlts.forEach(function(txt, i){
      var p = { x: elePos.x + 80, y: (i * 80) + elePos.y + 20 };

      items.push(new $.Text({
        text: txt,
        pos: p,
        size: 15
      }));

      items.push(new $.Text({
        text: textsDesc[i],
        pos: { x: p.x, y: p.y + 25},
        size: 15
      }));
    });

    var info = {
      text: "~ Apply an Element by clicking on the Web ~",
      pos: $.V.center(pos, size),
      size: 15,
      color: [255, 150, ]
    };

    info.pos.x -= (info.size*info.text.length*0.6)/2;
    info.pos.y = size.y-25;

    items.push(new $.Text(info));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);
  },

  initlevel: function(){
    var items = this.modalItems = [];
    var levels = this.levels = [];

    var size = { x: 600, y: 500 };
    var holderCtn = this.createHolder(size, "How good you think you are?", 0.6);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var textsOpts = [
      "    AMATEUR",
      "PRETTY GOOD",
      "EXPERIENCED",
      "     BUSTER!"
    ];

    var posOpts = { x: pos.x + size.x/2 - 70 , y: tltPos.y + 80 };
    textsOpts.forEach(function(txt, i){
      var p = { x: posOpts.x, y: (i * 60) + posOpts.y + 10 };

      var txtLvl = new $.Text({
        text: txt,
        pos: p,
        size: 15,
        color: "#fff"
      });

      items.push(txtLvl);
      levels.push(txtLvl);
    });

    this.levelIndex = 0;

    var info = {
      text: "~ shh .. be quiet, don't scare spiders ~",
      pos: $.V.center(pos, size),
      size: 15,
      color: [200, 200, 200]
    };

    info.pos.x -= (info.size*info.text.length*0.55)/2;
    info.pos.y = size.y-10;

    items.push(new $.Text(info));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);

    this.updateLevel();
  },

  initend: function(){
    var items = this.modalItems = [];

    var size = { x: 600, y: 250 };
    var holderCtn = this.createHolder(size, "LEVEL COMPLETED!", 0.85);
    var pos = holderCtn.holder.pos;
    var tltPos = holderCtn.title.pos;

    var sub = {
      text: "Good Job. Try a harder level.",
      pos: $.V.center(pos, size),
      size: 15,
    };

    sub.pos.x -= (sub.size*sub.text.length*0.6)/2;
    sub.pos.y = tltPos.y + sub.size*4 +10;

    items.push(new $.Text(sub));

    var enter = $.V.clone(pos);
    enter.y += size.y-30;
    this.initPressKey(enter);
  },

  hide: function(){
    var s = config.size;
    this.ctx.clearRect(0, 0, s.x, s.y);

    window.modal = "";
  },

  show: function(){
    this.hide();

    var ctx = this.ctx;
    var items = this.modalItems;

    this.bg.draw(ctx);

    if (this.type === "end"){
      items[1].text = this.won ? "LEVEL COMPLETED!" : "SPIDER MURDERER!";
      items[2].text = this.won ? 
        "Good Job. Try a harder level." : "Don't kill them!. Let's try again";
    }

    items.forEach(function(item){
      item.draw(ctx);
    });

    this.pressKey.draw(ctx);

    window.modal = this.type;
  },

  redraw: function(){
    this.hide();
    this.show();
  }

});