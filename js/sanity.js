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

// ── LOAD COMMERCIAL PROJECTS ──────────────────────────────────────────────
async function loadCommercial() {
  const grid = document.getElementById('c-gallery');
  if (!grid) return;

  const projects = await sanityQuery(
    '*[_type == "commercial"] | order(order asc)'
  );
  if (!projects || !projects.length) return;

  grid.innerHTML = '';

  projects.forEach(p => {
    const thumb = p.youtubeId
      ? ytThumb(p.youtubeId)
      : p.thumbnail ? imageUrl(p.thumbnail.asset._ref) : null;

    const statsStr = p.stats ? p.stats.join('|') : '';

    const card = document.createElement('div');
    card.className = 'c-card';
    card.dataset.vimeo    = p.vimeoId  || '';
    card.dataset.youtube  = p.youtubeId || '';
    card.dataset.role     = p.role     || '';
    card.dataset.stats    = statsStr;
    card.dataset.client   = `${p.client || ''} · ${p.type || ''} · ${p.year || ''}`;
    card.dataset.title    = p.title    || '';
    card.dataset.writeup  = p.writeup  || '';

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

    grid.appendChild(card);
  });

  // Update count
  const countEl = document.getElementById('c-count');
  if (countEl) countEl.textContent = projects.length + ' projects';

  // Rewire video modal clicks
  grid.querySelectorAll('.c-card').forEach(card => {
    card.addEventListener('click', () => {
      openVideoModal(card.dataset.vimeo, card.dataset.youtube, card);
    });
  });
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
