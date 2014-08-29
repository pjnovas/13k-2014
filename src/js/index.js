
(function(){
  var w = window;
  var doc = w.document;
  doc.title = "SPIDER BUSTERS";
  
  function $get(id){
    return doc.getElementById(id);
  }

  var gameCtn = $get("ctn");

  function $newCanvas(id){
    var cv = doc.createElement("canvas");
    cv.id = id;
    gameCtn.appendChild(cv);
    return cv;
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

    var w = getSize("Width") - 20;
    var h = getSize("Height") - 30;

    var max = { x: 1250, y: 750 };
    var min = { x: 950, y: 640 };

    var size = {
      x: (w > max.x ? max.x : w),
      y: (h > max.y ? max.y : h)
    };

    size.x = (size.x < min.x ? min.x : size.x);
    size.y = (size.y < min.y ? min.y : size.y);
    
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
      elements: ["fire", "water", "earth", "air"],
      methods: ["burn", "cool", "dirty", "blow"]
    };
  }

  function initGame(){

    w.Time = new $.GameTime();

    //w.Particles = new Particles();

    w.Controls = new $.Controls({
      container: gameCtn
    });

    w.game = new $.Game({
      viewport: $newCanvas("viewport"),
      world: $newCanvas("world"),
      vacuum: $newCanvas("vacuum"),
      modals: $newCanvas("modals")
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

    //w.game.play();
  }

  w.onload = onDocLoad;

}());