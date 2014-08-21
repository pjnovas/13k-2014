var w = window;
var doc = w.document;

w.DEBUG = true;

require("./reqAnimFrame");

var Game = require("./Game");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./Controls");
//var Particles = require("./Particles");

w.Mathf = require("./Mathf");
w.Color = require("./Color");
w.Vector = require("./Vector");
w.Renderer = require("./Renderer");
w.Repo = require("./Repo");

function configGame(){
  var cfg = require("./Settings")
    , ele = doc.documentElement
    , body = doc.body;

  function getSize(which){
    return Math.max(
      ele["client" + which], 
      body["scroll" + which], 
      ele["scroll" + which], 
      body["offset" + which], 
      ele["offset" + which]
    );
  }

  cfg.size = {
    x: getSize("Width"),
    y: getSize("Height")
  };

  w.config = cfg;
}

function initGame(){
  var cviewport = doc.getElementById("game-viewport");
  var cworld = doc.getElementById("game-world");
  var cvacuum = doc.getElementById("vacuum");

  w._ = new Utils();  
  w.Time = new GameTime();

  //w.Particles = new Particles();

  w.Controls = new Controls({
    container: cviewport
  });

  w.game = new Game({
    viewport: cviewport,
    world: cworld,
    vacuum: cvacuum
  });

  function pauseGame(){
    if (game.paused){
      game.start();
    }
    else {
      game.stop(); 
    }
  }

  w.Controls.on('pause', pauseGame);
}

function onDocLoad(){
  configGame();

  w.Repo.addResources(w.config.images)
    .on('error', function(err){
      console.log(err);
    })
    .on('report', function(prg){
      console.log("Images loaded: " + prg);
    })
    .on('complete', function(){
      initGame();
      w.game.start();
    })
    .load();
}

w.onload = onDocLoad;
