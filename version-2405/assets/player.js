(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var cover = player.querySelector("[data-player-cover]");
      var message = player.querySelector("[data-player-message]");
      var hls = null;
      var started = false;

      function setMessage(text) {
        if (!message) {
          return;
        }

        message.textContent = text;
        message.hidden = !text;
      }

      function hideCover() {
        if (cover) {
          cover.classList.add("is-hidden");
        }
      }

      function playVideo() {
        var result = video.play();

        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setMessage("点击播放按钮继续观看");
          });
        }
      }

      function start() {
        if (!video) {
          return;
        }

        hideCover();
        setMessage("");

        if (started) {
          playVideo();
          return;
        }

        started = true;
        var url = video.getAttribute("data-play");

        if (!url) {
          setMessage("播放暂时不可用");
          return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = url;
          playVideo();
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });

          hls.loadSource(url);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放暂时不可用");
            }
          });
          return;
        }

        video.src = url;
        playVideo();
      }

      if (cover) {
        cover.addEventListener("click", start);
      }

      if (video) {
        video.addEventListener("click", function () {
          if (!started) {
            start();
          }
        });

        video.addEventListener("play", hideCover);
      }

      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  });
})();
