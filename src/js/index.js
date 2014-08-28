
(function(){
  var w = window;
  var doc = w.document;
  var modal = document.querySelector(".bg-modal");

  //require("./reqAnimFrame");
  //require("./ng");

  //w.prefabs = require("./prefabs");

  //var Game = require("./Game");
  //var GameTime = require("./GameTime");

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

    var w = getSize("Width");
    var h = getSize("Height");

    var max = { x: 1250, y: 750 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    var gameCtn = doc.getElementById("game-ctn");
    gameCtn.style.width = size.x + "px";
    gameCtn.style.height = size.y + "px";

    return {
      size: size,
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

    w.Time = new $.GameTime();

    //w.Particles = new Particles();

    w.Controls = new $.Controls({
      container: doc.getElementById("game-ctn")
    });

    w.game = new $.Game({
      viewport: cviewport,
      world: cworld,
      vacuum: cvacuum
    });

    function toggleModal(show){
      modal.style.display = show ? "" : "none";
    }

    w.game.onWin(function(){
      modal.innerHTML = '<div class="finish">Win!</div>';
      toggleModal(true);
      game.stop(); 
    });

    w.game.onLoose(function(){
      modal.innerHTML = '<div class="finish">Loose!</div>';
      toggleModal(true);
      game.stop(); 
    });

    function pauseGame(){
      if (game.paused){
        toggleModal();
        game.play();
      }
      else {
        modal.innerHTML = '<div class="pause">Pause</div>';
        toggleModal(true);
        game.stop(); 
      }
    }

    toggleModal();
    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();

    $.Repo.addResources(w.config.images)
      .onComplete(function(){
        initGame();
        w.game.play();
      })
      .load();
  }

  w.onload = onDocLoad;

}());