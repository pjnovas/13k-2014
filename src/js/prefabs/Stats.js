
module.exports = Entity.extend({

  marginW: 40,
  marginH: 40,

  initialize: function(){
    this.pos = Vector.prod(config.stats.pos, config.size);

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

    this.iconAlives = new Sprite(spider);

    spider.pos = {
      x: this.pos.x - mW,
      y: this.pos.y + mH
    };

    this.iconKills = new Sprite(spider);
    
    this.lineAKills = new Line({
      pos: Vector.origin(spider.pos, spSize),
      to: Vector.add(hSpSize, spider.pos),
      size: 3,
      color: config.stats.colors.kills
    });

    this.lineBKills = new Line({
      pos: { x: spider.pos.x + hSpSize.x, y: spider.pos.y - hSpSize.y },
      to: { x: spider.pos.x - hSpSize.x, y: spider.pos.y + hSpSize.y },
      size: 3,
      color: config.stats.colors.kills
    });
  },

  createText: function(){
    var txtSize = 30;

    this.textKills = new Text({
      pos: { x: this.iconKills.pos.x - txtSize*3, y: this.iconKills.pos.y },
      size: txtSize,
      color: config.stats.colors.kills
    });

    this.textAlives = new Text({
      pos: { x: this.iconAlives.pos.x - txtSize*3, y: this.iconAlives.pos.y },
      size: txtSize,
      color: config.stats.colors.alives
    });

  },

  update: function(stats){
    this.stats = stats;

    this.textKills.text = _.pad(this.stats.killed, 3);
    this.textAlives.text = _.pad(this.stats.alives, 3);
  },

  draw: function(ctx){
    this.iconAlives.draw(ctx);

    this.iconKills.draw(ctx);
    this.lineAKills.draw(ctx);
    this.lineBKills.draw(ctx);

    this.textAlives.draw(ctx);
    this.textKills.draw(ctx);
  }

});
