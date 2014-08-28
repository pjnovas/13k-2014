
module.exports = ng.Collection.extend({

  pos: { x: 1, y: 0 },

  marginW: 40,
  marginH: 40,

  colors: {
    kills: [255,0,0,1],
    alives: [0,255,0,1]
  },

  start: function(){
    this.entities = [];
    this.pos = ng.Vector.prod(this.pos, config.size);

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
      , mW = this.marginW
      , mH = this.marginH
      , spSize = { x: size, y: size }
      , hSpSize = { x: size/2, y: size/2 };

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

    this.iconAlives = new ng.Sprite(spider);
    this.entities.push(this.iconAlives);

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH
    };

    this.iconKills = new ng.Sprite(spider);
    this.entities.push(this.iconKills);
    
    this.lineAKills = new ng.Line({
      pos: ng.Vector.origin(spider.pos, spSize),
      to: ng.Vector.add(hSpSize, spider.pos),
      size: 3,
      color: this.colors.kills
    });
    this.entities.push(this.lineAKills);

    this.lineBKills = new ng.Line({
      pos: { x: spider.pos.x + hSpSize.x, y: spider.pos.y - hSpSize.y },
      to: { x: spider.pos.x - hSpSize.x, y: spider.pos.y + hSpSize.y },
      size: 3,
      color: this.colors.kills
    });
    this.entities.push(this.lineBKills);
  },

  createText: function(){
    var txtSize = 30;

    this.textKills = new ng.Text({
      pos: { x: this.iconKills.pos.x - txtSize*3, y: this.iconKills.pos.y },
      size: txtSize,
      color: this.colors.kills
    });
    this.entities.push(this.textKills);

    this.textAlives = new ng.Text({
      pos: { x: this.iconAlives.pos.x - txtSize*3, y: this.iconAlives.pos.y },
      size: txtSize,
      color: this.colors.alives
    });
    this.entities.push(this.textAlives);

  },

  update: function(stats){
    this.stats = stats;

    this.textKills.text = _.pad(this.stats.killed, 3);
    this.textAlives.text = _.pad(this.stats.alives, 3);
  },

});
