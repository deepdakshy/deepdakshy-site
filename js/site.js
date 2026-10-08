/* deepdakshy.com — content from Sanity, cards, show more, video modal. */
(function () {
  'use strict';

  var SANITY = { project: 'h42w314b', dataset: 'production', api: 'v2024-01-01' };
  var CAP = 4;
  var page = document.body.getAttribute('data-page');

  // ── Helpers ───────────────────────────────────────────
  function q(sel, root) { return (root || document).querySelector(sel); }
  function qa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function sanity(query) {
    var url = 'https://' + SANITY.project + '.apicdn.sanity.io/' + SANITY.api +
      '/data/query/' + SANITY.dataset + '?query=' + encodeURIComponent(query);
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error('Sanity ' + r.status);
      return r.json();
    }).then(function (d) { return d.result; });
  }

  function imageUrl(img, width) {
    var ref = img && img.asset && img.asset._ref;
    if (!ref) return null;
    var m = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/);
    if (!m) return null;
    return 'https://cdn.sanity.io/images/' + SANITY.project + '/' + SANITY.dataset + '/' +
      m[1] + '-' + m[2] + '.' + m[3] + '?w=' + (width || 1200) + '&auto=format&fit=max';
  }

  function ytThumb(id) { id = youtubeId(id); return id ? 'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg' : null; }

  // Accept a bare ID or any pasted link/share string from Sanity.
  function vimeoParts(v) {
    if (!v) return null;
    var s = String(v).trim();
    var m = s.match(/(\d{6,})(?:\/([0-9a-f]{6,}))?/i);
    if (!m) return null;
    var hash = m[2] || (s.match(/[?&]h=([0-9a-f]+)/i) || [])[1];
    return { id: m[1], hash: hash || '' };
  }
  function youtubeId(v) {
    if (!v) return null;
    var s = String(v).trim();
    var m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/) || s.match(/^([\w-]{11})/);
    return m ? m[1] : null;
  }

  function embedUrl(item, autoplay) {
    var a = autoplay ? 1 : 0;
    var yt = youtubeId(item.youtubeId);
    if (yt) return 'https://www.youtube-nocookie.com/embed/' + yt + '?rel=0&modestbranding=1&playsinline=1&autoplay=' + a;
    var vm = vimeoParts(item.vimeoId);
    if (vm) return 'https://player.vimeo.com/video/' + vm.id + '?' + (vm.hash ? 'h=' + vm.hash + '&' : '') + 'title=0&byline=0&portrait=0&dnt=1&autoplay=' + a;
    return null;
  }

  function paragraphs(writeup) {
    if (!writeup) return [];
    var parts = Array.isArray(writeup) ? writeup : String(writeup).split(/\|\||\n{2,}/);
    return parts.map(function (s) { return String(s).trim(); }).filter(Boolean);
  }

  function pad2(n) { return n < 10 ? '0' + n : String(n); }
  function join(parts) { return parts.filter(Boolean).join(' · '); }

  var PLAY = '<svg class="card__play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5l12 7-12 7z"/></svg>';

  // ── Cards ─────────────────────────────────────────────
  function cardHTML(item, opts) {
    var thumb = opts.thumb;
    var frame = thumb
      ? '<img src="' + esc(thumb) + '" alt="" loading="lazy" decoding="async"' +
        (opts.fallback ? ' data-fallback="' + esc(opts.fallback) + '"' : '') + '>'
      : '<span class="card__ph">' + esc(item.title) + '</span>';
    var tag = opts.tag ? '<span class="card__tag">' + esc(opts.tag) + '</span>' : '';
    return '<button type="button" class="card' + (opts.vertical ? ' card--v' : '') + '" aria-label="Play ' + esc(item.title) + '">' +
      '<span class="card__frame">' + frame + tag + PLAY + '</span>' +
      '<span class="card__meta"><span class="card__title">' + esc(item.title) + '</span>' +
      '<span class="card__sub">' + esc(opts.sub) + '</span></span></button>';
  }

  // Swap a missing YouTube max-res thumb for the always-present hq one.
  document.addEventListener('error', function (e) {
    var t = e.target;
    if (t.tagName === 'IMG' && t.dataset.fallback) {
      t.src = t.dataset.fallback;
      delete t.dataset.fallback;
    }
  }, true);

  function renderList(opts) {
    var grid = q(opts.grid), btn = q(opts.button), count = q(opts.count);
    if (!grid) return;
    grid.classList.remove('skeleton');
    var items = opts.items || [];
    var open = false;
    var cap = opts.cap || CAP;

    if (count) count.textContent = items.length ? pad2(items.length) : '';
    if (!items.length) {
      grid.innerHTML = '<p class="empty">' + esc(opts.emptyText) + '</p>';
      if (btn) btn.hidden = true;
      return;
    }

    function draw() {
      var shown = open ? items : items.slice(0, cap);
      grid.innerHTML = shown.map(opts.card).join('');
      qa('.card', grid).forEach(function (el, i) {
        el.addEventListener('click', function () { opts.onOpen(shown[i]); });
      });
      if (btn) {
        btn.hidden = items.length <= cap;
        btn.textContent = open ? 'SHOW LESS −' : 'SHOW MORE +' + (items.length - cap);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
    }

    if (btn) btn.addEventListener('click', function () {
      open = !open;
      draw();
      if (!open) grid.scrollIntoView({ block: 'start' });
    });
    draw();
  }

  function loadFailed(gridSel) {
    var grid = q(gridSel);
    if (grid) grid.classList.remove('skeleton');
    if (grid) grid.innerHTML = '<p class="empty">Couldn’t load this right now. Refresh, or get in touch below.</p>';
  }

  // ── Modal ─────────────────────────────────────────────
  var modal = q('#modal');
  var lastFocus = null;

  function openModal(data) {
    if (!modal) return;
    lastFocus = document.activeElement;
    var player = q('.modal__player', modal);
    var src = embedUrl(data, data.autoplay !== false);
    player.className = 'modal__player' + (data.vertical ? ' modal__player--v' : '');
    player.innerHTML = src
      ? '<iframe src="' + esc(src) + '" title="' + esc(data.title) + '" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>'
      : (data.cover ? '<img src="' + esc(data.cover) + '" alt="">' : '');

    q('.modal__title', modal).textContent = data.title || '';
    q('.modal__facts', modal).innerHTML = (data.facts || []).filter(Boolean)
      .map(function (f) { return '<span class="t-label">' + esc(f) + '</span>'; }).join('');
    q('.modal__chips', modal).innerHTML = (data.chips || []).filter(Boolean)
      .map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
    q('.modal__text', modal).innerHTML = paragraphs(data.writeup)
      .map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    var stills = q('.modal__stills', modal);
    if (stills) stills.innerHTML = (data.stills || [])
      .map(function (s) { return '<img src="' + esc(s) + '" alt="" loading="lazy">'; }).join('');

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    modal.setAttribute('aria-label', data.title || 'Video');
    document.body.classList.add('no-scroll');
    modal.scrollTop = 0;
    q('.modal__close', modal).focus();
  }

  function closeModal() {
    if (!modal || !modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    q('.modal__player', modal).innerHTML = '';
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  if (modal) {
    q('.modal__close', modal).addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  }

  // ── Reels & settings ──────────────────────────────────
  function mountReel(key, item) {
    qa('[data-reel="' + key + '"]').forEach(function (box) {
      var section = box.closest('[data-reel-section]');
      var src = item && embedUrl(item, false);
      if (!src) { if (section) section.hidden = true; return; }
      box.innerHTML = '<iframe src="' + esc(src) + '" title="Showreel" loading="lazy" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>';
      if (section) section.hidden = false;
    });
  }

  function applySettings(s) {
    s = s || {};
    mountReel('commercial', { youtubeId: s.commercialShowreelYoutube, vimeoId: s.commercialShowreelVimeo });
    mountReel('vertical', { youtubeId: s.verticalShowreelYoutube });
    mountReel('art', { youtubeId: s.artShowreelYoutube, vimeoId: s.artShowreelVimeo });

    var hero = q('#hero-video');
    if (hero && s.heroVideoUrl && /^https:\/\//.test(s.heroVideoUrl)) {
      hero.src = s.heroVideoUrl;
      hero.load();
      playMuted(hero);
    }
    if (s.email) qa('a[href^="mailto:"]').forEach(function (a) {
      a.href = 'mailto:' + s.email;
      if (a.hasAttribute('data-email-text')) a.textContent = s.email.toUpperCase();
    });
  }

  function playMuted(v) {
    v.muted = true;
    var p = v.play && v.play();
    if (p && p.catch) p.catch(function () {});
  }

  // ── Pages ─────────────────────────────────────────────
  function loadCommercial() {
    sanity('*[_type == "commercial"] | order(order asc){_id, title, client, type, year, role, format, youtubeId, vimeoId, stats, description, writeup, thumbnail}')
      .then(function (list) {
        list = list || [];
        var horizontal = list.filter(function (p) { return p.format !== 'vertical'; });
        var vertical = list.filter(function (p) { return p.format === 'vertical'; });

        function open(p, isV) {
          openModal({
            title: p.title, youtubeId: p.youtubeId, vimeoId: p.vimeoId, vertical: isV,
            facts: [join([p.client, p.type, p.year]), p.role],
            chips: p.stats || [],
            writeup: p.writeup || p.description,
            cover: imageUrl(p.thumbnail, 1600)
          });
        }
        function thumbs(p, w) {
          var own = imageUrl(p.thumbnail, w);
          if (own) return { thumb: own };
          if (p.youtubeId) return { thumb: ytThumb(p.youtubeId), fallback: 'https://i.ytimg.com/vi/' + youtubeId(p.youtubeId) + '/hqdefault.jpg' };
          return {};
        }

        renderList({
          grid: '#work-grid', button: '#work-more', count: '#work-count', items: horizontal,
          emptyText: 'New work coming soon.',
          card: function (p) {
            var t = thumbs(p, 1200);
            return cardHTML(p, { thumb: t.thumb, fallback: t.fallback, sub: p.client || p.type });
          },
          onOpen: function (p) { open(p, false); }
        });
        renderList({
          grid: '#vertical-grid', button: '#vertical-more', count: '#vertical-count', items: vertical,
          emptyText: 'Vertical work coming soon.',
          card: function (p) {
            var t = thumbs(p, 700);
            return cardHTML(p, { thumb: t.thumb, fallback: t.fallback, sub: p.client || p.type, vertical: true });
          },
          onOpen: function (p) { open(p, true); }
        });
      })
      .catch(function () { loadFailed('#work-grid'); loadFailed('#vertical-grid'); });
  }

  function loadFilms() {
    sanity('*[_type == "film"] | order(order asc){_id, title, type, year, role, format, festival, director, dp, runtime, camera, vimeoId, youtubeId, cover, stills, writeup}')
      .then(function (list) {
        renderList({
          grid: '#film-grid', button: '#film-more', count: '#film-count', items: list || [], cap: 10,
          emptyText: 'Films coming soon.',
          card: function (f) {
            var thumb = imageUrl(f.cover, 1200) || ytThumb(f.youtubeId);
            return cardHTML(f, {
              thumb: thumb,
              fallback: !imageUrl(f.cover) && f.youtubeId ? 'https://i.ytimg.com/vi/' + youtubeId(f.youtubeId) + '/hqdefault.jpg' : null,
              sub: join([f.type, f.role, f.year]),
              tag: f.festival
            });
          },
          onOpen: function (f) {
            openModal({
              title: f.title, youtubeId: f.youtubeId, vimeoId: f.vimeoId, autoplay: false,
              facts: [join([f.type, f.role, f.year]), f.runtime],
              chips: [f.festival, f.director && 'Dir. ' + f.director, f.dp && 'DP ' + f.dp, f.camera],
              writeup: f.writeup,
              cover: imageUrl(f.cover, 1600),
              stills: (f.stills || []).map(function (s) { return imageUrl(s, 900); }).filter(Boolean)
            });
          }
        });
      })
      .catch(function () { loadFailed('#film-grid'); });
  }

  // ── Mobile menu ────────────────────────────────────────
  var navEl = q('.nav'), toggle = q('.nav__toggle');
  function setMenu(open) {
    if (!navEl || !toggle) return;
    navEl.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('no-scroll', open);
  }
  if (toggle) {
    toggle.addEventListener('click', function () { setMenu(!navEl.classList.contains('is-open')); });
    qa('.nav__links a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 900) setMenu(false); });
  }

  qa('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  // Hero video: make sure muted autoplay starts on every browser.
  var heroVideo = q('#hero-video');
  if (heroVideo) playMuted(heroVideo);

  sanity('*[_type == "settings"][0]{heroVideoUrl, commercialShowreelYoutube, commercialShowreelVimeo, verticalShowreelYoutube, artShowreelYoutube, artShowreelVimeo, email}')
    .then(applySettings)
    .catch(function () { applySettings(null); });

  if (page === 'commercial') loadCommercial();
  if (page === 'art') loadFilms();
})();
