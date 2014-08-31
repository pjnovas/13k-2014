
(function(){
  var w = window;
  var doc = w.document;
  doc.title = "SPIDER BUSTERS";

  w.modal = "";
  
  function $get(id){
    return doc.getElementById(id);
  }

  var gameCtn = $get("ctn");
  //gameCtn.style.backgroundImage = 'url("'+$.sprites.bg+'")';

  function $newCanvas(id){
    var cv = doc.createElement("canvas");
    cv.id = id;
    gameCtn.appendChild(cv);
    return cv;
  }

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
      levels:[ 
        [10, 5, 5], [25, 20, 5], [50, 40, 5], [80, 70, 2]
      ],
      elements: ["fire", "water", "earth", "air"],
      methods: ["burn", "cool", "dirty", "blow"]
    };
  }

  function initGame(){

    w.Time = new $.GameTime();

    w.Controls = new $.Controls({
      container: gameCtn
    });

    w.game = new $.Game({
      cview: $newCanvas("viewport"),
      cworld: $newCanvas("world"),
      cvacuum: $newCanvas("vacuum"),
      cmodals: $newCanvas("modals")
    });

    function pauseGame(){
      if (game.paused){
        game.mainModal.hide();
        game.play();
      }
      else {
        game.mainModal.show();
        game.stop(); 
      }
    }

    w.Controls.on('pause', pauseGame);
  }

  function onDocLoad(){
    w.config = configGame();

    $.repo = $.Creator.getSprites();

    gameCtn.style.backgroundImage = 'url("' + $.repo.bg.src + '")';

    var favicon = $get("favicon");
    favicon.href = $.repo.favicon;

    initGame();
  }

  w.onload = onDocLoad;

}());