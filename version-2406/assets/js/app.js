(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHTML(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var menu = document.querySelector('[data-mobile-menu]');
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var active = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        if (timer) {
          window.clearInterval(timer);
        }
        play();
      });
    });

    show(0);
    play();
  }

  function initCardFilters() {
    var search = document.querySelector('[data-card-search]');
    var year = document.querySelector('[data-filter-year]');
    var type = document.querySelector('[data-filter-type]');
    var cards = selectAll('[data-movie-card]');
    if (!cards.length || (!search && !year && !type)) {
      return;
    }

    function apply() {
      var term = search ? search.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var typeValue = type ? type.value : '';
      cards.forEach(function (card) {
        var haystack = [
          card.dataset.title,
          card.dataset.genre,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type
        ].join(' ').toLowerCase();
        var matchedTerm = !term || haystack.indexOf(term) !== -1;
        var matchedYear = !yearValue || card.dataset.year === yearValue;
        var matchedType = !typeValue || card.dataset.type === typeValue;
        card.hidden = !(matchedTerm && matchedYear && matchedType);
      });
    }

    [search, year, type].forEach(function (item) {
      if (item) {
        item.addEventListener('input', apply);
        item.addEventListener('change', apply);
      }
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHTML(tag) + '</span>';
    }).join('');
    return '<article class="movie-card" data-movie-card>' +
      '<a class="movie-poster" href="./' + escapeHTML(movie.file) + '">' +
      '<img src="' + escapeHTML(movie.cover) + '" alt="' + escapeHTML(movie.title) + '" loading="lazy">' +
      '<span class="poster-type">' + escapeHTML(movie.type) + '</span>' +
      '<span class="poster-score">' + escapeHTML(movie.score) + '</span>' +
      '</a>' +
      '<div class="movie-info">' +
      '<h3><a href="./' + escapeHTML(movie.file) + '">' + escapeHTML(movie.title) + '</a></h3>' +
      '<p>' + escapeHTML(movie.one_line) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHTML(movie.region) + '</span><span>' + escapeHTML(movie.year) + '</span><span>' + escapeHTML(movie.genre) + '</span></div>' +
      '<div class="movie-tags">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function initSearchPage() {
    var holder = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    if (!holder || !window.__MOVIES__) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render(term) {
      var normalized = term.trim().toLowerCase();
      var results = window.__MOVIES__.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, (movie.tags || []).join(' '), movie.one_line].join(' ').toLowerCase();
        return !normalized || haystack.indexOf(normalized) !== -1;
      }).slice(0, 96);
      holder.innerHTML = results.map(movieCard).join('');
    }

    render(query);
    if (input) {
      input.addEventListener('input', function () {
        render(input.value);
      });
    }
  }

  function initPlayer(source) {
    var video = document.getElementById('videoPlayer');
    var overlay = document.querySelector('[data-player-overlay]');
    if (!video || !overlay || !source) {
      return;
    }

    var hls = null;
    var attached = false;
    var requestedPlay = false;

    function setMessage(text) {
      overlay.innerHTML = '<span class="play-icon">▶</span><strong>' + escapeHTML(text) + '</strong>';
    }

    function startVideo() {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          overlay.hidden = false;
          setMessage('立即播放');
        });
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (requestedPlay) {
            startVideo();
          }
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            overlay.hidden = false;
            setMessage('暂时无法播放');
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        video.addEventListener('loadedmetadata', function () {
          if (requestedPlay) {
            startVideo();
          }
        }, { once: true });
      } else {
        overlay.hidden = false;
        setMessage('暂时无法播放');
      }
    }

    function play() {
      requestedPlay = true;
      overlay.hidden = true;
      attachSource();
      if (attached && video.readyState > 0) {
        startVideo();
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('click', function () {
      if (!attached) {
        play();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.initPlayer = initPlayer;

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initCardFilters();
    initSearchPage();
  });
}());
