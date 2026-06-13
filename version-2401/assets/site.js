(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;
  var timer = null;

  function setSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, itemIndex) {
      slide.classList.toggle('is-active', itemIndex === currentSlide);
    });

    dots.forEach(function (dot, itemIndex) {
      dot.classList.toggle('is-active', itemIndex === currentSlide);
    });
  }

  function playSlides() {
    if (slides.length < 2) {
      return;
    }

    timer = window.setInterval(function () {
      setSlide(currentSlide + 1);
    }, 5200);
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      window.clearInterval(timer);
      setSlide(index);
      playSlides();
    });
  });

  setSlide(0);
  playSlides();

  var searchInput = document.querySelector('[data-site-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applySearch(value) {
    var query = normalize(value);
    var visible = 0;

    cards.forEach(function (card) {
      var target = normalize(card.getAttribute('data-search'));
      var matched = !query || target.indexOf(query) !== -1;
      card.classList.toggle('hidden-card', !matched);

      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('is-visible', cards.length > 0 && visible === 0);
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      applySearch(searchInput.value);
    });
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      filterButtons.forEach(function (item) {
        item.classList.remove('is-active');
      });

      button.classList.add('is-active');

      if (searchInput) {
        searchInput.value = button.getAttribute('data-filter-value') || '';
        applySearch(searchInput.value);
      }
    });
  });
})();
