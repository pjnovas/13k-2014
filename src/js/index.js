
require("./reqAnimFrame");
var GameTime = require("./GameTime");

window.onload = function() {
  
  window.Time = new GameTime();

  var Game = require('./Game');
  window.game = new Game();

  window.game.start();
};