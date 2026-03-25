// ── SANITY CONNECTION ─────────────────────────────────────────────────────
const SANITY_PROJECT_ID = 'h42w314b';
const SANITY_DATASET    = 'production';
const SANITY_API_VER    = '2024-01-01';

function sanityQuery(query) {
  const encoded = encodeURIComponent(query);
  const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VER}/data/query/${SANITY_DATASET}?query=${encoded}`;
  return fetch(url).then(r => r.json()).then(d => d.result);
}

function imageUrl(ref) {
  if (!ref) return null;
  const [, id, dims, fmt] = ref.match(/^image-([a-f0-9]+)-(\d+x\d+)-(\w+)$/) || [];
  if (!id) return null;
  return `https://cdn.sanity.io/images/${SANITY_PROJECT_ID}/${SANITY_DATASET}/${id}-${dims}.${fmt}`;
}

function ytThumb(id) {
  if (!id) return null;
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

// ── BUILD CARD ────────────────────────────────────────────────────────────
function buildCard(p, isVertical) {
  const thumb = p.youtubeId
    ? ytThumb(p.youtubeId)
    : p.thumbnail ? imageUrl(p.thumbnail.asset._ref) : null;

  const statsStr = p.stats ? p.stats.join('|') : '';

  const card = document.createElement('div');
  card.className = isVertical ? 'c-card vertical' : 'c-card';
  card.dataset.vimeo   = p.vimeoId   || '';
  card.dataset.youtube = p.youtubeId || '';
  card.dataset.role    = p.role      || '';
  card.dataset.stats   = statsStr;
  card.dataset.client  = `${p.client || ''} · ${p.type || ''} · ${p.year || ''}`;
  card.dataset.title   = p.title     || '';
  card.dataset.writeup = p.writeup   || '';

  card.innerHTML = `
    <div class="c-thumb">
      ${thumb
        ? `<img src="${thumb}" alt="${p.title}" loading="lazy">`
        : `<div class="c-thumb-ph">${p.title || 'Add thumbnail'}</div>`}
      <div class="c-play">▶</div>
    </div>
    <div class="c-info">
      <p class="c-client">${p.client || ''} &nbsp;·&nbsp; ${p.type || ''} &nbsp;·&nbsp; ${p.year || ''}</p>
      <p class="c-title">${p.title || ''}</p>
      <p class="c-role">${p.role || ''}</p>
      <p class="c-desc">${p.description || ''}</p>
    </div>`;

  card.addEventListener('click', () => {
    openVideoModal(card.dataset.vimeo, card.dataset.youtube, card);
  });

  return card;
}

// ── LOAD MORE ────────────────────────────────────────────────────────────
function initLoadMoreDynamic(gridId, btnId, countId, perPage) {
  const grid  = document.getElementById(gridId);
  const btn   = document.getElementById(btnId);
  const count = document.getElementById(countId);
  if (!grid || !btn) return;

  const cards = Array.from(grid.children);
  const total = cards.length;
  let shown   = 0;

  function showNext() {
    const next = Math.min(shown + perPage, total);
    for (let i = shown; i < next; i++) {
      cards[i].style.display = '';
      setTimeout(() => cards[i].classList.add('visible'), (i - shown) * 60);
    }
    shown = next;
    if (count) count.textContent = shown + ' / ' + total;
    if (shown >= total) {
      btn.style.display = 'none';
      if (count) count.textContent = 'All ' + total + ' shown';
    }
  }

  // Hide all first
  cards.forEach(c => { c.style.display = 'none'; c.classList.remove('visible'); });
  shown = 0;
  showNext();
  btn.addEventListener('click', showNext);
  btn.style.display = total > perPage ? '' : 'none';

  // Show wrap
  const wrap = btn.parentElement;
  if (wrap) wrap.style.display = '';
}

// ── LOAD MORE FOR SANITY GRIDS ───────────────────────────────────────────
function initSanityLoadMore(gridId, btnId, countId, perPage) {
  const grid  = document.getElementById(gridId);
  const btn   = document.getElementById(btnId);
  const count = document.getElementById(countId);
  if (!grid || !btn) return;

  const cards = Array.from(grid.children);
  const total = cards.length;
  let shown   = 0;

  function showNext() {
    const next = Math.min(shown + perPage, total);
    for (let i = shown; i < next; i++) {
      cards[i].style.display = '';
      setTimeout(() => cards[i].classList.add('visible'), (i - shown) * 60);
    }
    shown = next;
    if (count) count.textContent = shown + ' / ' + total;
    if (shown >= total) {
      btn.style.display = 'none';
      if (count) count.textContent = 'All ' + total + ' shown';
    }
  }

  // Hide all first
  cards.forEach(c => { c.style.display = 'none'; c.classList.remove('visible'); });
  showNext();
  btn.addEventListener('click', showNext);

  // Show wrap
  const wrap = btn.parentElement;
  if (wrap) wrap.style.display = 'flex';
}

// ── LOAD COMMERCIAL PROJECTS ──────────────────────────────────────────────
async function loadCommercial() {
  const grid    = document.getElementById('c-gallery');
  const vGrid   = document.getElementById('v-gallery');
  if (!grid) return;

  const projects = await sanityQuery(
    '*[_type == "commercial"] | order(order asc)'
  );
  if (!projects || !projects.length) return;

  grid.innerHTML = '';
  if (vGrid) vGrid.innerHTML = '';

  let hCount = 0;
  let vCount = 0;

  projects.forEach(p => {
    const isVertical = p.format === 'vertical';
    const card = buildCard(p, isVertical);

    if (isVertical && vGrid) {
      vGrid.appendChild(card);
      vCount++;
    } else {
      grid.appendChild(card);
      hCount++;
    }
  });

  // Update counts
  const countEl = document.getElementById('c-count');
  if (countEl) countEl.textContent = hCount + ' projects';

  const vCountEl = document.getElementById('v-count');
  if (vCountEl && vCount > 0) vCountEl.textContent = vCount + ' videos';

  // Always show vertical section, show placeholder if empty
  const vSection = document.getElementById('vertical-section');
  if (vSection) vSection.style.display = 'block';

  if (vCount === 0 && vGrid) {
    vGrid.innerHTML = '<p style="font-family:var(--mono);font-size:.6rem;color:var(--dim);padding:20px 0 20px 40px;">Mark projects as Vertical in Sanity to populate this section.</p>';
  }

  // Hide load more buttons for now — show all cards
  const cWrap = document.getElementById('c-load-more-wrap');
  const vWrap = document.getElementById('v-load-more-wrap');
  if (cWrap) cWrap.style.display = 'none';
  if (vWrap) vWrap.style.display = 'none';
}

// ── LOAD FILMS ────────────────────────────────────────────────────────────
async function loadFilms() {
  const grid = document.getElementById('film-grid');
  if (!grid) return;

  const films = await sanityQuery(
    '*[_type == "film"] | order(order asc)'
  );
  if (!films || !films.length) return;

  grid.innerHTML = '';

  films.forEach(f => {
    const thumb = f.cover
      ? imageUrl(f.cover.asset._ref)
      : f.youtubeId ? ytThumb(f.youtubeId) : null;

    const stills = f.stills
      ? f.stills.map(s => imageUrl(s.asset._ref)).filter(Boolean).join(',')
      : '';

    const writeup = f.writeup
      ? f.writeup.join(' || ')
      : '';

    const card = document.createElement('div');
    card.className = 'film-card c-card';
    card.dataset.title    = f.title    || '';
    card.dataset.type     = f.type     || '';
    card.dataset.year     = f.year     || '';
    card.dataset.role     = f.role     || '';
    card.dataset.format   = f.format   || '';
    card.dataset.festival = f.festival || '';
    card.dataset.director = f.director || '';
    card.dataset.dp       = f.dp       || '';
    card.dataset.runtime  = f.runtime  || '';
    card.dataset.camera   = f.camera   || '';
    card.dataset.vimeo    = f.vimeoId  || '';
    card.dataset.youtube  = f.youtubeId || '';
    card.dataset.cover    = thumb      || '';
    card.dataset.images   = stills;
    card.dataset.writeup  = writeup;

    card.innerHTML = `
      <div class="c-thumb">
        ${thumb
          ? `<img src="${thumb}" alt="${f.title}" loading="lazy">`
          : `<div class="c-thumb-ph">${f.title || ''}</div>`}
        <div class="c-play">▶</div>
      </div>
      <div class="c-info">
        <div class="c-client">${f.type || ''} · ${f.role || ''} · ${f.year || ''}</div>
        <div class="c-title">${f.title || ''}</div>
        <div class="c-desc">${f.festival || ''}</div>
      </div>`;

    grid.appendChild(card);
  });

  // Rewire overlay clicks
  grid.querySelectorAll('.film-card').forEach(card => {
    card.addEventListener('click', () => openFilm(card));
  });
}

// ── LOAD SETTINGS (showreels, hero video, contact) ────────────────────────
async function loadSettings() {
  const settings = await sanityQuery('*[_type == "settings"][0]');
  if (!settings) return;

  // Commercial showreel
  const commReel = document.querySelector('.art-intro-reel-embed .reel-wrap');
  if (commReel && (settings.commercialShowreelYoutube || settings.commercialShowreelVimeo)) {
    const id  = settings.commercialShowreelYoutube;
    const vid = settings.commercialShowreelVimeo;
    const src = id
      ? `https://www.youtube.com/embed/${id}`
      : `https://player.vimeo.com/video/${vid}?title=0&byline=0&portrait=0`;
    commReel.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }

  // Vertical showreel
  const vReelWrap = document.querySelector('#vertical-showreel .reel-wrap');
  const vReelSection = document.getElementById('vertical-showreel');
  if (vReelWrap && settings.verticalShowreelYoutube) {
    vReelWrap.innerHTML = `<iframe src="https://www.youtube.com/embed/${settings.verticalShowreelYoutube}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
    if (vReelSection) vReelSection.style.display = 'block';
  }

  // Art showreel — same element id on art page
  const artReel = document.querySelector('#art-showreel .reel-wrap');
  if (artReel && (settings.artShowreelYoutube || settings.artShowreelVimeo)) {
    const id  = settings.artShowreelYoutube;
    const vid = settings.artShowreelVimeo;
    const src = id
      ? `https://www.youtube.com/embed/${id}`
      : `https://player.vimeo.com/video/${vid}?title=0&byline=0&portrait=0`;
    artReel.innerHTML = `<iframe src="${src}" allow="autoplay; fullscreen" allowfullscreen></iframe>`;
  }

  // Contact details
  const contactLinks = document.querySelectorAll('.contact-link');
  // Only update if settings have values
  if (settings.email) {
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = `mailto:${settings.email}`;
      a.textContent = settings.email;
    });
  }
  if (settings.phone) {
    document.querySelectorAll('a[href^="tel:"]').forEach(a => {
      a.href = `tel:${settings.phone.replace(/\s/g,'')}`;
      a.textContent = settings.phone;
    });
  }
}

// ── INIT ──────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadCommercial();
  loadFilms();
  loadSettings();
});
