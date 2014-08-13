
require("./reqAnimFrame");
var GameTime = require("./GameTime");

window.onload = function() {
  
  window.Time = new GameTime();

  var Game = require("./Game");
  window.game = new Game({
    viewport: document.getElementById("game-viewport"),
    world: document.getElementById("game-world"),
    size: {
      width: 800,
      height: 600
    }
  });

  window.game.start();
};