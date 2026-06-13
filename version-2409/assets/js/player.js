function initMoviePlayer(videoId, sourceUrl) {
    var video = document.getElementById(videoId);
    if (!video) {
        return;
    }
    var shell = video.closest(".player-shell");
    var overlay = shell ? shell.querySelector(".player-overlay") : null;
    var loaded = false;
    var hlsInstance = null;

    function start() {
        if (!loaded) {
            loaded = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
            } else if (window.Hls && Hls.isSupported()) {
                hlsInstance = new Hls({ enableWorker: true });
                hlsInstance.loadSource(sourceUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = sourceUrl;
            }
        }
        if (shell) {
            shell.classList.add("is-playing");
        }
        video.controls = true;
        var play = video.play();
        if (play && typeof play.catch === "function") {
            play.catch(function () {
                if (shell) {
                    shell.classList.remove("is-playing");
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener("click", start);
    }
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        if (shell) {
            shell.classList.add("is-playing");
        }
    });
    video.addEventListener("ended", function () {
        if (hlsInstance && typeof hlsInstance.stopLoad === "function") {
            hlsInstance.stopLoad();
        }
    });
}
