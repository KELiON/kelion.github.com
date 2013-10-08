// shim layer with setTimeout fallback
window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function(){
  var loadedMeta = false,
      dataLoaded = false,
      played = false;

  $("#play").click(function(){
    played = !played;
    $(this).toggleClass('b-button__play');
    if (played) {
      player.play();
    }
    else {
      player.pause();
    }
  });

  var player = new MediaElementPlayer('audio', {
    features: ['current','progress','duration'],
    keyActions: false,
    pluginPath: '/assets/visualizer/',
    webkitFlash: true,
    audioWidth: '90%'
  });

  var visualizer = function(){
    var data = null,
        visualize = true,
        colors = ['#764995','#602b70'],
        startTime = new Date().getTime(),
        canvas = document.getElementById('visual-wrapper');

    if (typeof G_vmlCanvasManager != 'undefined') {
      G_vmlCanvasManager.initElement(canvas);
    }

    var ctx = canvas.getContext('2d'),
        maxCount = 10;

    canvas.width = $(canvas).parent().width();
    canvas.height = $(canvas).parent().height();

    setInterval(function(){
      startTime = new Date().getTime() - player.getCurrentTime()*1000;
    }, 400);

    function getTime(){
      //in flash getCurrentTime() works slow, make hack for it
      return (new Date().getTime() - startTime)/1000;
    }

    function getData(current){
      return data[Math.round(current / 0.04) * 0.04];
    }

    var width = 20,
        margin = 3;
    if (margin+30*(width+margin)+20 < canvas.width) {
      width = (canvas.width-20-margin)/30-margin;
    }

    function draw(){
      if (played && loadedMeta && visualize && dataLoaded && data) {
        var time = getTime();
        if (time > 0) {
          var bars = getData(time);
              //i = 0;
          if (bars) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (var i = 0, max = bars.length; i < max; i++) {
              var count = bars[i] / maxCount,
                  y = null;
              ctx.fillStyle = colors[0];
              for (var j=0; j<count; j++) {
                y = canvas.height - j*7;
                ctx.fillRect(margin+i*(width+margin), y, width, 5);
              }
              if (Math.round(count) > count) {
                ctx.fillStyle = colors[1];
                y = canvas.height - j*7;
                ctx.fillRect(margin+i*(width+margin), y, width, 5);
              }
            }
          }
        }
      }
      requestAnimationFrame(draw);
    }


    draw();
    return {
      stop: function(){
        visualize = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      },
      start: function(){
        visualize = true;
        startTime = new Date().getTime() - player.getCurrentTime()*1000;
      },
      load: function(url){
        data = false;
        $.getJSON(url, function(d){
          data = d;
          dataLoaded = true;
          startTime = new Date().getTime() - player.getCurrentTime()*1000;
        });
      }
    };
  }();

  $(window).load(function(){
    player.load();
    player.media.addEventListener('loadedmetadata', function(){
      loadedMeta = true;
    });
    player.media.addEventListener('ended', function(){
      $("#play").click();
      visualizer.stop();
    });

    visualizer.load(document.getElementById('player').getAttribute('data-visualization'));
    visualizer.start();
  });
}());