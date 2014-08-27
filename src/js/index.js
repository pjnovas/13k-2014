var w = window;
var doc = w.document;

w.DEBUG = true;

require("./reqAnimFrame");

w.Base = require("./Base/Base");

w.Mathf = require("./Mathf");
w.Color = require("./Color");
w.Vector = require("./Vector");
w.Renderer = require("./Renderer");
w.Repo = require("./Repo");

w.Entity = require("./Base/Entity");
w.Collection = require("./Base/Collection");

w.Circle = require("./Base/Circle");
w.Line = require("./Base/Line");
w.Sprite = require("./Base/Sprite");

var Game = require("./Game");
var GameTime = require("./GameTime");
var Utils = require("./Utils");
var Controls = require("./prefabs/Controls");
//var Particles = require("./Particles");

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
    .on('complete', function(){
      initGame();
      w.game.start();
    })
    .load();
}

w.onload = onDocLoad;
