
module.exports = Base.extend({

  entities: [],

  initialize: function(){
    this.entities = [];
  },

  update: function(){
    this.entities.forEach(function (entity) {
      entity.update();
    });
  },

  draw: function(ctx){
    this.entities.forEach(function (entity) {
      entity.draw(ctx);
    });
  },

});
