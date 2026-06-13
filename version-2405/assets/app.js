(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var menuToggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (menuToggle && mobileNav) {
      menuToggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var backTop = document.querySelector("[data-back-top]");

    if (backTop) {
      window.addEventListener("scroll", function () {
        if (window.scrollY > 320) {
          backTop.classList.add("is-visible");
        } else {
          backTop.classList.remove("is-visible");
        }
      });

      backTop.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function startTimer() {
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }

      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          window.clearInterval(timer);
          showSlide(dotIndex);
          startTimer();
        });
      });

      startTimer();
    }

    var listTools = document.querySelector("[data-list-tools]");

    if (listTools) {
      var searchInput = listTools.querySelector("[data-list-search]");
      var filterButtons = Array.prototype.slice.call(listTools.querySelectorAll("[data-filter]"));
      var cards = Array.prototype.slice.call(document.querySelectorAll(".filter-card"));
      var emptyState = document.querySelector("[data-empty-state]");
      var activeFilter = "all";
      var params = new URLSearchParams(window.location.search);
      var queryFromUrl = params.get("q") || "";

      if (searchInput && queryFromUrl) {
        searchInput.value = queryFromUrl;
      }

      function matchCard(card, query, filterValue) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var filterText = [
          card.getAttribute("data-type") || "",
          card.getAttribute("data-region") || "",
          card.getAttribute("data-category") || "",
          card.getAttribute("data-genre") || "",
          text
        ].join(" ").toLowerCase();
        var queryMatch = !query || text.indexOf(query) !== -1;
        var filterMatch = filterValue === "all" || filterText.indexOf(filterValue.toLowerCase()) !== -1;

        return queryMatch && filterMatch;
      }

      function updateList() {
        var query = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var visible = 0;

        cards.forEach(function (card) {
          var matched = matchCard(card, query, activeFilter);
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (searchInput) {
        searchInput.addEventListener("input", updateList);
      }

      filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
          activeFilter = button.getAttribute("data-filter") || "all";
          filterButtons.forEach(function (other) {
            other.classList.toggle("is-active", other === button);
          });
          updateList();
        });
      });

      updateList();
    }
  });
})();
