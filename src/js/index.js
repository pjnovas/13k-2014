var w = window;
var doc = w.document;

require("./reqAnimFrame");

require("./psycho");

w.prefabs = require("./prefabs");

var Game = require("./Game");
var GameTime = require("./GameTime");

//var Particles = require("./Particles");

function configGame(){
  var ele = doc.documentElement
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

  w.config = {
    size: {
      x: getSize("Width"),
      y: getSize("Height")
    },
    world: {
      margin: { x: 150, y: 20 }
    },
    vacuum: {
      size: { x: 300, y: 500 }
    },
    images: {  
        "spider": "images/spider.png"
      , "elements": "images/elements.png"
    }
  };
}

function initGame(){
  var cviewport = doc.getElementById("game-viewport");
  var cworld = doc.getElementById("game-world");
  var cvacuum = doc.getElementById("vacuum");

  w._ = {
    pad: function(num, size) {
      var s = "0000000" + num;
      return s.substr(s.length-size);
    }
  };

  w.Time = new GameTime();

  //w.Particles = new Particles();

  w.Controls = new prefabs.Controls({
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

  w.psycho.Repo.addResources(w.config.images)
    .onComplete(function(){
      initGame();
      w.game.start();
    })
    .load();
}

w.onload = onDocLoad;
