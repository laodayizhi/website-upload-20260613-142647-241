import { H as Hls } from './hls-vendor-dru42stk.js';

const selectors = {
  menuToggle: '[data-menu-toggle]',
  mobileMenu: '[data-mobile-menu]',
  hero: '[data-hero]',
  searchBox: '[data-search-box]',
  searchInput: '[data-search-input]',
  searchForm: '[data-search-form]',
  searchResults: '[data-search-results]',
  filterPage: '[data-filter-page]',
  player: '[data-player]'
};

function text(value) {
  return String(value || '').toLowerCase();
}

function safe(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function initMenu() {
  const toggle = document.querySelector(selectors.menuToggle);
  const menu = document.querySelector(selectors.mobileMenu);
  if (!toggle || !menu) {
    return;
  }
  toggle.addEventListener('click', () => {
    menu.classList.toggle('is-open');
  });
}

function initHero() {
  const root = document.querySelector(selectors.hero);
  if (!root) {
    return;
  }
  const slides = Array.from(root.querySelectorAll('.hero-slide'));
  const dots = Array.from(root.querySelectorAll('[data-hero-dot]'));
  const prev = root.querySelector('[data-hero-prev]');
  const next = root.querySelector('[data-hero-next]');
  if (slides.length <= 1) {
    return;
  }
  let active = 0;
  let timer = null;

  const show = (index) => {
    active = (index + slides.length) % slides.length;
    slides.forEach((slide, idx) => slide.classList.toggle('is-active', idx === active));
    dots.forEach((dot, idx) => dot.classList.toggle('is-active', idx === active));
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => show(active + 1), 5200);
  };

  prev?.addEventListener('click', () => {
    show(active - 1);
    restart();
  });

  next?.addEventListener('click', () => {
    show(active + 1);
    restart();
  });

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      show(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  root.addEventListener('mouseenter', () => window.clearInterval(timer));
  root.addEventListener('mouseleave', restart);
  restart();
}

function renderSearchResults(box, query) {
  const results = box.querySelector(selectors.searchResults);
  if (!results) {
    return;
  }
  const movies = window.SEARCH_MOVIES || [];
  const keyword = text(query).trim();
  if (!keyword) {
    results.classList.remove('is-open');
    results.innerHTML = '';
    return;
  }
  const matches = movies
    .filter((movie) => text(`${movie.title} ${movie.region} ${movie.type} ${movie.year} ${movie.genre} ${movie.tags}`).includes(keyword))
    .slice(0, 8);
  if (!matches.length) {
    results.innerHTML = '<div class="search-result-item"><div></div><div><strong>暂无匹配内容</strong><span>换个关键词试试</span></div></div>';
    results.classList.add('is-open');
    return;
  }
  results.innerHTML = matches.map((movie) => `
    <a class="search-result-item" href="${safe(movie.link)}">
      <span class="search-result-cover" style="background-image: url('${safe(movie.cover)}');"></span>
      <span>
        <strong>${safe(movie.title)}</strong>
        <span>${safe(movie.region)} · ${safe(movie.type)} · ${safe(movie.year)}</span>
        <span>${safe(movie.oneLine)}</span>
      </span>
    </a>
  `).join('');
  results.classList.add('is-open');
}

function initSearch() {
  document.querySelectorAll(selectors.searchBox).forEach((box) => {
    const input = box.querySelector(selectors.searchInput);
    const form = box.querySelector(selectors.searchForm);
    const results = box.querySelector(selectors.searchResults);
    if (!input || !form || !results) {
      return;
    }
    input.addEventListener('input', () => renderSearchResults(box, input.value));
    input.addEventListener('focus', () => renderSearchResults(box, input.value));
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const keyword = input.value.trim();
      if (keyword) {
        window.location.href = `./search.html?q=${encodeURIComponent(keyword)}`;
      } else {
        window.location.href = './search.html';
      }
    });
  });

  document.addEventListener('click', (event) => {
    document.querySelectorAll(selectors.searchBox).forEach((box) => {
      if (!box.contains(event.target)) {
        box.querySelector(selectors.searchResults)?.classList.remove('is-open');
      }
    });
  });
}

function initFilters() {
  const page = document.querySelector(selectors.filterPage);
  if (!page) {
    return;
  }
  const cards = Array.from(document.querySelectorAll('.filter-card'));
  const keywordInput = page.querySelector('[data-filter-keyword]');
  const categorySelect = page.querySelector('[data-filter-category]');
  const typeSelect = page.querySelector('[data-filter-type]');
  const yearSelect = page.querySelector('[data-filter-year]');
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get('q');
  if (initialQuery && keywordInput) {
    keywordInput.value = initialQuery;
  }

  const apply = () => {
    const keyword = text(keywordInput?.value).trim();
    const category = categorySelect?.value || '';
    const type = typeSelect?.value || '';
    const year = yearSelect?.value || '';
    cards.forEach((card) => {
      const source = text(`${card.dataset.title} ${card.dataset.region} ${card.dataset.type} ${card.dataset.year} ${card.dataset.tags}`);
      const byKeyword = !keyword || source.includes(keyword);
      const byCategory = !category || card.dataset.category === category;
      const byType = !type || text(card.dataset.type).includes(text(type));
      const byYear = !year || card.dataset.year === year;
      card.classList.toggle('is-hidden', !(byKeyword && byCategory && byType && byYear));
    });
  };

  [keywordInput, categorySelect, typeSelect, yearSelect].forEach((control) => {
    control?.addEventListener('input', apply);
    control?.addEventListener('change', apply);
  });
  apply();
}

function initPlayer() {
  const shell = document.querySelector(selectors.player);
  if (!shell) {
    return;
  }
  const video = shell.querySelector('video');
  const button = shell.querySelector('[data-play-button]');
  const source = shell.dataset.source;
  let hls = null;
  let ready = false;

  const prepare = () => {
    if (!video || !source || ready) {
      return;
    }
    ready = true;
    if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: false,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
        } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
        } else {
          hls.destroy();
          hls = null;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    }
  };

  const play = () => {
    prepare();
    button?.classList.add('is-hidden');
    video?.play().catch(() => {
      button?.classList.remove('is-hidden');
    });
  };

  button?.addEventListener('click', play);
  video?.addEventListener('play', () => button?.classList.add('is-hidden'));
  video?.addEventListener('pause', () => button?.classList.remove('is-hidden'));
  video?.addEventListener('click', () => prepare());
  prepare();
  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHero();
  initSearch();
  initFilters();
  initPlayer();
});
