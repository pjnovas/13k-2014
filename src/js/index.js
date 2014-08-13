window.onload = function() {
  require("./reqAnimFrame");
  var Game = require('./Game');
  window.game = new Game();

  window.game.start();
};