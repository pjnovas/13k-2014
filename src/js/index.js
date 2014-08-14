
require("./reqAnimFrame");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");

window.Mathf = require("./Mathf");
window.Color = require("./Color");
window.Vector = require("./Vector");
window.Physics = require("./Physics");
window.Renderer = require("./Renderer");

window.onload = function() {
  
  var cviewport = document.getElementById("game-viewport");
  var cworld = document.getElementById("game-world");

  window.Utils = new Utils();  
  window.Time = new GameTime();

  window.Controls = new Controls({
    container: cviewport
  });

  var Game = require("./Game");

  window.config = require("./Settings");

  window.config.size = {
    x: 1000,
    y: 600
  };

  window.game = new Game({
    viewport: cviewport,
    world: cworld
  });

  window.game.start();
};