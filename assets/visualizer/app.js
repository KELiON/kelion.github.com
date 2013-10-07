(function(){
  var player = new MediaElementPlayer('audio', {
      features: ['current','progress','duration'],
      keyActions: false,
      pluginPath: '/assets/visualizer/',
      webkitFlash: false,
      audioWidth: '90%'
  });

  var visualizer = function(){
    var data = null;
    var visualize = true;
    var getData = function(current){
      var d;
      var min = 100000;
      var temp;
      for (var t in data) {
        temp = Math.abs(current-parseFloat(t));
        if (temp < min) {
          d = data[t];
          min = temp;
        }
      }
      return d;
    };


    var canvas = document.getElementById('visual-wrapper');
    var ctx = canvas.getContext('2d');

    var maxCount = 10;

    var initCanvas = function(){
      canvas.width = $(canvas).parent().width();
      canvas.height = $(canvas).parent().height();
    };
    initCanvas();

    var colors = ['#764995','#602b70'];

    var dataLoaded = false;


    var onLoadData = function(){
      dataLoaded = true;
      startTime = new Date().getTime() - player.getCurrentTime()*1000;
    };

    var startTime = new Date().getTime();

    setInterval(function(){
      startTime = new Date().getTime() - player.getCurrentTime()*1000;
    },100);


    var getTime = function(){
      //in flash getCurrentTime() works slow, make hack for it
      return (new Date().getTime()-startTime)/1000;
    };

    var width = 20;
    var margin = 3;
    if (margin+30*(width+margin)+20 < canvas.width) {
      width = (canvas.width-20-margin)/30-margin;
    }

    var redraw = function(){
      var for_draw = null;
      if (getTime() > 0) {
        for_draw = getData(getTime());
      }
      if (for_draw) {
        var i = 0;
        ctx.clearRect(0,0,canvas.width,canvas.height);

        for (var t in for_draw) {
          var count = for_draw[t] / maxCount;
          ctx.fillStyle = colors[0];
          var y;
          for (var j=0;j<count;j++) {
            y = canvas.height - j*7;
            ctx.fillRect(margin+i*(width+margin), y, width, 5);
          }
          if (Math.round(count) > count) {
            ctx.fillStyle = colors[1];
            y = canvas.height - j*7;
            ctx.fillRect(margin+i*(width+margin), y, width, 5);
          }
          i++;
        }
      }
    };

    var draw = function(){
      if (visualize && dataLoaded && data) {
        redraw();
      }
      requestAnimationFrame(draw);
    };


    draw();
    return {
      stop: function(){
        visualize = false;
      },
      start: function(){
        visualize = true;
        startTime = new Date().getTime() - player.getCurrentTime()*1000;
      },
      trackLoaded: function(){
        trackLoaded = true;
        startTime = new Date().getTime();
      },
      clear: function(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
      },
      load: function(url){
        data = false;
        trackLoaded = false;
        dataLoaded = false;
        $.getJSON(url,function(d){
          data = d;
          onLoadData();
        });
      }
    };
  }();

  player.play();
  visualizer.load(document.getElementById('player').getAttribute('data-visualization'));
  visualizer.start();
}());