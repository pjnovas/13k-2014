
module.exports = {

  nodes: {
      size: 3
    , targetSize: 6
    , colors: {
        cold: [255,255,255,1]
      , burn: [255,0,0,1]
      , burned: [0,0,0,0.2]
      , earth: [190,160,40,1]
      , target: [0,0,255,1]
    }
  },

  paths: {
      size: 2
    , tBurn: 0.5
    , colors: {
        burned: [0,0,0,0.2]
    }
  },

  spiders: {
      size: 32
    , quantity: 50
    , color: [115,255,0]
    , speed: 0.05
    , speedAlert: 0.1
    , behaviour: {
        alertTemp: 0
      , tStayA: 3000
      , tStayB: 10000
    }
    , sprites: {
        move: [{
          x: 0,
          y: 0,
          w: 32,
          h: 32
        }, {
          x: 32,
          y: 0,
          w: 32,
          h: 32
        }]
    }
  },

  images: {  
      "spider": "images/spider.png"
  }

};
