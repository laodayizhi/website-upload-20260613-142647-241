(function() {
  const toggle = document.querySelector("[data-menu-toggle]");
  const mobileNav = document.querySelector("[data-mobile-nav]");
  if (toggle && mobileNav) {
    toggle.addEventListener("click", function() {
      mobileNav.classList.toggle("is-open");
    });
  }

  const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
  let current = 0;
  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function(slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === current);
    });
    dots.forEach(function(dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === current);
    });
  }
  dots.forEach(function(dot) {
    dot.addEventListener("click", function() {
      const index = Number(dot.getAttribute("data-hero-dot"));
      showSlide(index);
    });
  });
  if (slides.length > 1) {
    setInterval(function() {
      showSlide(current + 1);
    }, 5200);
  }

  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function runFilter(input) {
    const scope = input.closest("main") || document;
    const list = scope.querySelector("[data-filter-list]");
    const empty = scope.querySelector("[data-empty-state]");
    if (!list) {
      return;
    }
    const query = normalize(input.value);
    const cards = Array.from(list.children);
    let visible = 0;
    cards.forEach(function(card) {
      const text = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-meta") + " " + card.textContent);
      const matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  const filterInputs = Array.from(document.querySelectorAll("[data-filter-input]"));
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  filterInputs.forEach(function(input) {
    if (query && !input.value) {
      input.value = query;
    }
    input.addEventListener("input", function() {
      runFilter(input);
    });
    runFilter(input);
  });
}());
