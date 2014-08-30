
$.C = $.Base.extend({ }, {

  white: [255,255,255,1],

  toRGBA: function(arr){
    if (Array.isArray(arr)){
      return "rgba(" + (arr[0] || 0) + "," + (arr[1] || 0) + "," + (arr[2] || 0) + "," + (arr[3] || 1).toFixed(1) + ")";
    }
    return arr;
  },

  lerp: function(from, to, t){

    function l(a, b, t, m){
      m = m ? m : 1;
      return Math.round($.M.lerp(a, b, t) * m) / m;
    }

    return [
        l(from[0], to[0], t)
      , l(from[1], to[1], t)
      , l(from[2], to[2], t)
      , l(
          from[3] >= 0 ? from[3]: 1
        , to[3] >= 0 ? to[3] : 1
        , t
        , 100
        )
    ];
  },

  eql: function(a, b){
    return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
  }

});
