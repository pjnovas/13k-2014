
$.Modal = $.Base.extend({

  start: function(options){
    this.ctx = options.ctx;
    this.type = options.type;
    this._onExit = options.onExit;

    this.modalItems = {};

    this.initBackDrop();
    this["init" + this.type]();

    document.addEventListener("keyup", this._onKeyUp.bind(this));
  },

  _onKeyUp: function(e){
    var key = (e.which || e.keyCode);
    if (key === 13 && window.modal === this.type && this._onExit){
      this.hide();
      this._onExit();
    }
  },

  initBackDrop: function(){
    this.bg = new $.Rect({
      pos: { x: 0, y: 0},
      size: config.size,
      corner: 10,
      fill: [0,0,0,0.5]
    });
  },

  initmain: function(){
    var size = { x: 600, y: 500 };
    var pos = $.V.center($.V.zero, config.size);
    pos.x -= size.x/2;
    pos.y -= size.y/2;

    var items = this.modalItems.main = [];

    items.push(new $.Rect({
      pos: pos,
      size: size,
      fill: [30,30,30,1],
      corner: 10,
      stroke: {
        size: 3,
        color: [255,255,255,1]
      }
    }));

    var title = {
      text: document.title,
      pos: $.V.center(pos, size),
      size: 20
    };

    title.pos.x -= (title.size*title.text.length*0.8)/2;
    title.pos.y = pos.y + title.size*2;

    items.push(new $.Text(title));

    var sub = {
      text: "Use The Elements to lead spiders into the Vacuum!",
      pos: $.V.center(pos, size),
      size: 15,
    };

    sub.pos.x -= (sub.size*sub.text.length*0.6)/2;
    sub.pos.y = title.pos.y + sub.size*2.5 +10;

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
      "Burn the web but could kill spiders too!",
      "Fire propagates fast!, use the water to stop it",
      "Stops the fire and won't let spiders re-build the web",
      "Burn faster, annoys spiders and removes dirty"
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

    var enter = {
      text: "-- PRESS ENTER --",
      pos: $.V.clone(pos),
      size: 20,
      color: [0,255,0,1]
    };

    enter.pos.x += (enter.size*enter.text.length)/2;
    enter.pos.y += size.y-30;
    items.push(new $.Text(enter));
  },

  hide: function(){
    var s = config.size;
    this.ctx.clearRect(0, 0, s.x, s.y);

    window.modal = "";
  },

  show: function(){
    var ctx = this.ctx;
    this.bg.draw(ctx);

    this.modalItems[this.type].forEach(function(item){
      item.draw(ctx);
    });

    window.modal = this.type;
  }

});