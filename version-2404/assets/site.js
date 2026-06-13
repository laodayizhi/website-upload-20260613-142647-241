import { H as Hls } from "./hls-dru42stk.js";

const menuButton = document.querySelector("[data-menu-toggle]");
const mobileNav = document.querySelector("[data-mobile-nav]");

if (menuButton && mobileNav) {
    menuButton.addEventListener("click", () => {
        mobileNav.classList.toggle("is-open");
    });
}

const hero = document.querySelector("[data-hero]");

if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    let currentIndex = 0;

    const showSlide = (nextIndex) => {
        if (!slides.length) {
            return;
        }

        currentIndex = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, index) => {
            slide.classList.toggle("is-active", index === currentIndex);
        });

        dots.forEach((dot, index) => {
            dot.classList.toggle("is-active", index === currentIndex);
        });
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => {
            showSlide(index);
        });
    });

    window.setInterval(() => {
        showSlide(currentIndex + 1);
    }, 5200);
}

const searchInputs = document.querySelectorAll("[data-site-search]");

searchInputs.forEach((input) => {
    const cards = Array.from(document.querySelectorAll("[data-search-card]"));

    input.addEventListener("input", () => {
        const query = input.value.trim().toLowerCase();

        cards.forEach((card) => {
            const text = [
                card.getAttribute("data-title"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.textContent
            ].join(" ").toLowerCase();

            card.classList.toggle("is-hidden", query.length > 0 && !text.includes(query));
        });
    });
});

const initializePlayer = async (video) => {
    const source = video.dataset.src;

    if (!source) {
        return;
    }

    if (video.dataset.ready === "true") {
        await video.play().catch(() => undefined);
        return;
    }

    video.dataset.ready = "true";

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", () => {
            video.play().catch(() => undefined);
        }, { once: true });
        return;
    }

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            video.play().catch(() => undefined);
        });
        video._hls = hls;
    }
};

const playerButtons = document.querySelectorAll("[data-player-start]");

playerButtons.forEach((button) => {
    const shell = button.closest(".player-shell");
    const video = shell ? shell.querySelector("[data-hls-player]") : null;

    if (!video) {
        return;
    }

    const start = () => {
        button.classList.add("is-hidden");
        initializePlayer(video);
    };

    button.addEventListener("click", start);
    video.addEventListener("click", start, { once: true });
});

const params = new URLSearchParams(window.location.search);
const query = params.get("q");

if (query) {
    searchInputs.forEach((input) => {
        input.value = query;
        input.dispatchEvent(new Event("input"));
    });
}
