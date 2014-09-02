
$.Stats = $.Collection.extend({

  pos: { x: 1, y: 0 },

  colors: {
    kills: "#ff0000"
  },

  start: function(){
    this.entities = [];
    this.pos = $.V.prod(this.pos, config.size);

    this.colors.alives = "#" + $.sprites.color;

    this.stats = {
      saved: 0,
      killed: 0,
      alives: 0,
      total: 0
    };

    this.createIcons();
    this.createText();
  },

  createIcons: function(){
    var size = 40
      , mW = 30
      , mH = 40
      , spSize = { x: size, y: size }
      /*, hSpSize = { x: size/2, y: size/2 }*/;

    var spider = {
      resource: "spider",
      sprite: { x: 0, y: 0, w: 32, h: 32 },
      size: spSize,
      angle: Math.PI / 2
    };

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH + size*1.5
    };

    this.iconAPos = spider.pos;
    this.entities.push(new $.Sprite(spider));

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH
    };

    this.iconKPos = spider.pos;
    this.entities.push(new $.Sprite(spider));
    
    this.entities.push(new $.Text({
      pos: { x: spider.pos.x-15, y: spider.pos.y },
      text: "X",
      size: 30,
      color: this.colors.kills
    }));

  },

  createText: function(){
    var txtSize = 30
      , killPos = this.iconKPos
      , alivePos = this.iconAPos;

    this.textKills = new $.Text({
      pos: { x: killPos.x - txtSize*3.5, y: killPos.y },
      size: txtSize,
      color: this.colors.kills
    });
    this.entities.push(this.textKills);

    this.textAlives = new $.Text({
      pos: { x: alivePos.x - txtSize*2.5, y: alivePos.y },
      size: txtSize,
      color: this.colors.alives
    });
    this.entities.push(this.textAlives);

  },

  update: function(stats){
    this.stats = stats;

    this.textKills.text = stats.killed + " / " + this.maxKills;
    this.textAlives.text = _.pad(stats.alives, 2);
  },

});
