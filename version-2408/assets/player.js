(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function setupPlayer(box) {
    var video = box.querySelector('video');
    var button = box.querySelector('.play-overlay');
    var status = box.querySelector('.player-status');
    var url = box.getAttribute('data-vsrc');
    var attached = false;
    var hls = null;

    function setStatus(message) {
      if (status) {
        status.textContent = message || '';
      }
    }

    function attachVideo() {
      if (attached) {
        return true;
      }
      if (!video || !url) {
        setStatus('视频暂时无法加载，请稍后重试');
        return false;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus('');
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            setStatus('视频加载较慢，正在重新连接');
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            setStatus('视频正在恢复播放');
            hls.recoverMediaError();
            return;
          }
          setStatus('视频暂时无法播放');
        });
        attached = true;
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        attached = true;
        return true;
      }
      setStatus('此设备暂时无法播放该视频');
      return false;
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      if (!attachVideo()) {
        return;
      }
      if (button) {
        button.classList.add('is-hidden');
      }
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          if (button) {
            button.classList.remove('is-hidden');
          }
          setStatus('点击画面即可开始播放');
        });
      }
    }

    if (button) {
      button.addEventListener('click', start);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          start();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', function () {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('pause', function () {
        if (!video.ended && button) {
          button.classList.remove('is-hidden');
        }
      });
      video.addEventListener('error', function () {
        setStatus('视频暂时无法播放');
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
  });
}());
