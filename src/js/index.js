
(function(){
  var w = window;
  var doc = w.document;
  
  function $get(id){
    return doc.getElementById(id);
  }

  //var Particles = require("./Particles");

  function configGame(){
    var ele = doc.documentElement
      , body = doc.body;

    function getSize(which){
      var offset = "offset", scroll = "scroll";
      return Math.max(
        ele["client" + which], 
        ele[scroll + which], 
        ele[offset + which],
        body[scroll + which], 
        body[offset + which] 
      );
    }

    var w = getSize("Width");
    var h = getSize("Height");

    var max = { x: 1250, y: 750 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    var gameCtn = $get("game-ctn");
    gameCtn.style.width = size.x + "px";
    gameCtn.style.height = size.y + "px";

    return {
      size: size,
      world: {
        margin: { x: 150, y: 20 }
      },
      vacuum: {
        size: { x: 300, y: 500 }
      }
    };
  }

  function initGame(){
    var cviewport = $get("game-viewport");
    var cworld = $get("game-world");
    var cvacuum = $get("vacuum");

    w.Time = new $.GameTime();

    //w.Particles = new Particles();

    w.Controls = new $.Controls({
      container: $get("game-ctn")
    });

    w.game = new $.Game({
      viewport: cviewport,
      world: cworld,
      vacuum: cvacuum
    });

    w.game.onWin(function(){
      console.log("YOU WIN");
      game.stop(); 
    });

    w.game.onLoose(function(){
      console.log("YOU LOOSE");
      game.stop(); 
    });

    function pauseGame(){
      if (game.paused){
        game.play();
      }
      else {
        game.stop(); 
      }
    }

    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();

    $.repo = $.Creator.getSprites();

    initGame();
    w.game.play();
  }

  w.onload = onDocLoad;

}());