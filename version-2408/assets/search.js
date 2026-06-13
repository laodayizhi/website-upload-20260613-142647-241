(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  function text(value) {
    return String(value || '').toLowerCase();
  }

  function card(item) {
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="./' + item.file + '" aria-label="' + item.titleEsc + '">',
      '<img src="./' + item.cover + '.jpg" alt="' + item.titleEsc + '" loading="lazy">',
      '<span class="badge year-badge">' + item.year + '</span>',
      '<span class="badge type-badge">' + item.typeEsc + '</span>',
      '<span class="play-bubble">▶</span>',
      '</a>',
      '<div class="card-body">',
      '<h3><a href="./' + item.file + '">' + item.titleEsc + '</a></h3>',
      '<div class="card-meta"><a href="./category-' + item.categorySlug + '.html">' + item.categoryEsc + '</a><span>' + item.regionEsc + '</span></div>',
      '<p class="card-line">' + item.lineEsc + '</p>',
      '</div>',
      '</article>'
    ].join('');
  }

  ready(function () {
    var items = window.SEARCH_ITEMS || [];
    var input = document.querySelector('[data-search-page-input]');
    var select = document.querySelector('[data-search-page-category]');
    var results = document.querySelector('[data-search-results]');
    var state = document.querySelector('[data-search-state]');
    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';

    if (input) {
      input.value = initial;
    }

    function render() {
      if (!results) {
        return;
      }
      var q = text(input && input.value).trim();
      var category = select ? select.value : '';
      var matched = items.filter(function (item) {
        var hay = text([item.title, item.year, item.type, item.region, item.genre, item.tags, item.line].join(' '));
        var ok = !q || hay.indexOf(q) !== -1;
        if (category && item.categorySlug !== category) {
          ok = false;
        }
        return ok;
      });
      var limited = matched.slice(0, 180);
      if (state) {
        state.textContent = matched.length ? '为你呈现相关影片' : '没有找到匹配影片';
      }
      if (!limited.length) {
        results.innerHTML = '<div class="empty-state">换一个片名、年份、地区或题材继续查找</div>';
        return;
      }
      results.innerHTML = limited.map(card).join('');
    }

    if (input) {
      input.addEventListener('input', render);
    }
    if (select) {
      select.addEventListener('change', render);
    }
    render();
  });
}());
