
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

  function getSize(which){
    return Math.max(
      document.documentElement["client" + which], 
      document.body["scroll" + which], 
      document.documentElement["scroll" + which], 
      document.body["offset" + which], 
      document.documentElement["offset" + which]
    );
  }

  var width = getSize("Width");
  var height = getSize("Height");

  window.config.size = {
    x: width - 50,
    y: height - 50
  };

  window.game = new Game({
    viewport: cviewport,
    world: cworld
  });

  window.game.start();

  function pauseGame(){
    if (game.paused){
      game.start();
    }
    else {
      game.stop(); 
    }
  }

  window.Controls.on('pause', pauseGame);
};