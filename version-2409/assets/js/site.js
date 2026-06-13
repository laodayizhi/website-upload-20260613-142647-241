(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function initMobileNav() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var nav = document.querySelector("[data-mobile-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        if (prev) {
            prev.addEventListener("click", function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener("click", function () {
                show(current + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot") || 0));
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function initFilters() {
        var root = document.querySelector("[data-filter-root]");
        if (!root) {
            return;
        }
        var search = root.querySelector("[data-filter-search]");
        var year = root.querySelector("[data-filter-year]");
        var type = root.querySelector("[data-filter-type]");
        var region = root.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
        var empty = document.querySelector("[data-empty-state]");

        function apply() {
            var q = normalize(search && search.value);
            var y = normalize(year && year.value);
            var t = normalize(type && type.value);
            var r = normalize(region && region.value);
            var visible = 0;

            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags"),
                    card.textContent
                ].join(" "));
                var match = true;
                if (q && text.indexOf(q) === -1) {
                    match = false;
                }
                if (y && normalize(card.getAttribute("data-year")) !== y) {
                    match = false;
                }
                if (t && normalize(card.getAttribute("data-type")).indexOf(t) === -1) {
                    match = false;
                }
                if (r && normalize(card.getAttribute("data-region")).indexOf(r) === -1) {
                    match = false;
                }
                card.style.display = match ? "" : "none";
                if (match) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("show", visible === 0);
            }
        }

        [search, year, type, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
    }

    function movieCard(movie) {
        return [
            '<a class="movie-card" href="' + movie.url + '">',
            '<div class="poster-wrap">',
            '<img src="' + movie.cover + '" alt="' + movie.title.replace(/"/g, '&quot;') + '" loading="lazy">',
            '<div class="poster-gradient"></div>',
            '<div class="poster-badges"><span>' + movie.year + '</span><span>' + movie.type + '</span></div>',
            '<div class="poster-play">▶</div>',
            '</div>',
            '<div class="movie-card-body">',
            '<h3>' + movie.title + '</h3>',
            '<p>' + movie.oneLine + '</p>',
            '<div class="movie-meta"><span>' + movie.region + '</span><span>' + movie.category + '</span></div>',
            '</div>',
            '</a>'
        ].join('');
    }

    function initSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var input = document.querySelector("[data-search-input]");
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");
        if (!form || !input || !results || !window.SEARCH_INDEX) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;

        function render(query) {
            var q = normalize(query);
            var list = window.SEARCH_INDEX.filter(function (movie) {
                var text = normalize([movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine, movie.category].join(" "));
                return !q || text.indexOf(q) !== -1;
            }).slice(0, 96);
            results.innerHTML = list.map(movieCard).join("");
            if (summary) {
                summary.textContent = q ? "已为你匹配相关影片" : "热门影片推荐";
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var q = input.value.trim();
            var url = q ? "search.html?q=" + encodeURIComponent(q) : "search.html";
            window.history.replaceState(null, "", url);
            render(q);
        });
        input.addEventListener("input", function () {
            render(input.value);
        });
        render(initial);
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    ready(function () {
        initMobileNav();
        initHero();
        initFilters();
        initSearchPage();
        initBackTop();
    });
})();
