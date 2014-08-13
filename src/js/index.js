
require("./reqAnimFrame");
var GameTime = require("./GameTime");

window.Mathf = require("./Mathf");
window.Vector = require("./Vector");
window.Renderer = require("./Renderer");

window.onload = function() {
  
  window.Time = new GameTime();

  var Game = require("./Game");

  window.config = require("./Settings");

  window.config.size = {
    x: 1000,
    y: 600
  };

  window.game = new Game({
    viewport: document.getElementById("game-viewport"),
    world: document.getElementById("game-world")
  });

  window.game.start();
};