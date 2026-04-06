// ── CURSOR ────────────────────────────────────────────────────────────────
const $c = document.getElementById('cursor');
const $r = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => {
  mx = e.clientX; my = e.clientY;
  if ($c) { $c.style.left = mx + 'px'; $c.style.top = my + 'px'; }
});
(function tick() {
  if ($r) {
    rx += (mx - rx) * 0.11;
    ry += (my - ry) * 0.11;
    $r.style.left = rx + 'px';
    $r.style.top  = ry + 'px';
  }
  requestAnimationFrame(tick);
})();

// ── NAV ───────────────────────────────────────────────────────────────────
const $nav = document.getElementById('nav');
if ($nav) {
  const tick = () => $nav.classList.toggle('scrolled', window.scrollY > 30);
  window.addEventListener('scroll', tick, { passive: true });
  tick();
}
document.querySelectorAll('.nav-links a').forEach(a => {
  const p = new URL(a.href, location.href).pathname.replace(/\/$/, '');
  const c = location.pathname.replace(/\/$/, '');
  if (c === p || (p.length > 1 && c.startsWith(p))) a.classList.add('active');
});

// ── SCROLL REVEAL ─────────────────────────────────────────────────────────
const revObs = new IntersectionObserver(entries => {
  entries.forEach((e, i) => {
    if (e.isIntersecting) {
      setTimeout(() => e.target.classList.add('visible'), i * 60);
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.06 });
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

// ── VIDEO MODAL (commercial cards & film cards with data-vimeo/youtube) ───
const $vm        = document.getElementById('video-modal');
const $vmEmbed   = $vm?.querySelector('.vm-embed');
const $vmClose   = $vm?.querySelector('.vm-close');
const $vmBackdrop= $vm?.querySelector('.vm-backdrop');

function openVideoModal(vimeoId, youtubeId, card) {
  if (!$vm || !$vmEmbed) return;
  let src = '';
  if (vimeoId)   src = `https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`;
  if (youtubeId) src = `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`;
  $vmEmbed.innerHTML = src
    ? `<iframe src="${src}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`
    : `<div style="aspect-ratio:16/9;display:flex;align-items:center;justify-content:center;background:var(--surface);font-family:var(--mono);font-size:.6rem;color:var(--dim);">Video coming soon</div>`;

  if (card) {
    const d = card.dataset;
    const $vmClient = $vm.querySelector('.vm-client');
    const $vmTitle  = $vm.querySelector('.vm-title');
    const $vmRole   = $vm.querySelector('.vm-role');
    const $vmStats  = $vm.querySelector('.vm-stats');
    const $vmWriteup= $vm.querySelector('.vm-writeup');

    if ($vmClient) $vmClient.textContent = d.client || '';
    if ($vmTitle)  $vmTitle.textContent  = d.title  || '';
    if ($vmRole)   $vmRole.textContent   = d.role   || '';

    if ($vmStats && d.stats) {
      const stats = d.stats.split('|').map(s => s.trim()).filter(Boolean);
      $vmStats.innerHTML = stats.map(s => {
        const parts = s.match(/^(.+?)\s+([\w\s&+]+)$/);
        if (parts) return `<div class="vm-stat"><div class="vm-stat-val">${parts[1]}</div><div class="vm-stat-label">${parts[2]}</div></div>`;
        return `<div class="vm-stat"><div class="vm-stat-val">${s}</div></div>`;
      }).join('');
      $vmStats.style.display = 'flex';
    } else if ($vmStats) {
      $vmStats.innerHTML = '';
      $vmStats.style.display = 'none';
    }

    if ($vmWriteup) $vmWriteup.textContent = d.writeup || '';
  }

  $vm.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
  if (!$vm) return;
  $vm.classList.remove('open');
  document.body.style.overflow = '';
  if ($vmEmbed) $vmEmbed.innerHTML = ''; // stops video
}

$vmClose?.addEventListener('click', closeVideoModal);
$vmBackdrop?.addEventListener('click', closeVideoModal);

// Wire commercial cards — open video modal with stats + writeup
document.querySelectorAll('.c-card').forEach(card => {
  if (!card.classList.contains('film-card')) {
    card.addEventListener('click', () => {
      openVideoModal(card.dataset.vimeo, card.dataset.youtube, card);
    });
  }
});

// ── FILM OVERLAY ──────────────────────────────────────────────────────────
const $overlay = document.getElementById('film-overlay');

function openFilm(card) {
  if (!$overlay) return;
  const d = card.dataset;

  $overlay.querySelector('.overlay-type').textContent  = d.type  || '';
  $overlay.querySelector('.overlay-title').textContent = d.title || '';

  // Meta
  const metaRow = $overlay.querySelector('.overlay-meta-row');
  metaRow.innerHTML = '';
  [
    { label: 'Year',     val: d.year     },
    { label: 'Role',     val: d.role     },
    { label: 'Format',   val: d.format   },
    { label: 'Screened', val: d.festival },
  ].forEach(m => {
    if (!m.val) return;
    metaRow.innerHTML += `<div class="overlay-meta-item">${m.label} <span>${m.val}</span></div>`;
  });

  // Left side — video if available, otherwise cover image
  const $cover = $overlay.querySelector('.overlay-cover');
  if (d.vimeo) {
    $cover.innerHTML = `<div class="overlay-cover-video"><iframe src="https://player.vimeo.com/video/${d.vimeo}?title=0&byline=0&portrait=0" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
  } else if (d.youtube) {
    $cover.innerHTML = `<div class="overlay-cover-video"><iframe src="https://www.youtube.com/embed/${d.youtube}?rel=0&modestbranding=1" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;
  } else if (d.cover) {
    $cover.innerHTML = `<img src="${d.cover}" alt="${d.title}">`;
  } else {
    $cover.innerHTML = `<div class="overlay-cover-ph">Add hero still or video ID</div>`;
  }

  // Stills below
  const $imgs = $overlay.querySelector('.overlay-images');
  $imgs.innerHTML = '';
  const images = d.images ? d.images.split(',').map(s => s.trim()).filter(Boolean) : [];
  if (images.length) {
    images.forEach((src, i) => {
      const div = document.createElement('div');
      div.className = 'overlay-img-item';
      div.dataset.lb = src;
      div.innerHTML = `<img src="${src}" alt="Still ${i+1}">`;
      $imgs.appendChild(div);
    });
  } else {
    for (let i = 1; i <= 6; i++) {
      $imgs.innerHTML += `<div class="overlay-img-item"><div class="overlay-img-ph">Still ${i}</div></div>`;
    }
  }

  // Write-up
  const $write = $overlay.querySelector('.overlay-write');
  $write.innerHTML = d.writeup
    ? d.writeup.split('||').map(p => `<p>${p.trim()}</p>`).join('')
    : '<p>Write-up coming soon.</p>';

  // Credits
  const $cred = $overlay.querySelector('.overlay-credits');
  $cred.innerHTML = `<p class="overlay-credits-label">Credits</p>`;
  [
    { label: 'Director',       val: d.director },
    { label: 'Cinematography', val: d.dp        },
    { label: 'Runtime',        val: d.runtime   },
    { label: 'Camera',         val: d.camera    },
    { label: 'Screened',       val: d.festival  },
  ].forEach(cr => {
    if (!cr.val) return;
    $cred.innerHTML += `<div class="credit-item"><p class="credit-sub">${cr.label}</p>${cr.val}</div>`;
  });

  // Trailer section — hide it, video is now on the left
  const $trailer = $overlay.querySelector('.overlay-trailer');
  if ($trailer) $trailer.innerHTML = '';

  initLightbox();
  $overlay.classList.add('open');
  $overlay.scrollTop = 0;
  document.body.style.overflow = 'hidden';
}

function closeFilm() {
  if (!$overlay) return;
  $overlay.classList.remove('open');
  document.body.style.overflow = '';
  // Stop any playing video on left side
  const $cover = $overlay.querySelector('.overlay-cover');
  const ifr = $cover?.querySelector('iframe');
  if (ifr) { const s = ifr.src; ifr.src = ''; ifr.src = s; }
}

// Film cards (with data-title) open the overlay
document.querySelectorAll('.film-card').forEach(card => {
  card.addEventListener('click', () => openFilm(card));
});

document.querySelectorAll('.overlay-close, .overlay-back').forEach(btn => {
  btn.addEventListener('click', closeFilm);
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeFilm(); closeLightbox(); closeVideoModal(); }
});

// ── LIGHTBOX ──────────────────────────────────────────────────────────────
const $lb    = document.getElementById('lightbox');
const $lbImg = $lb?.querySelector('img');
let lbSrcs = [], lbIdx = 0;

function initLightbox() {
  lbSrcs = [];
  document.querySelectorAll('[data-lb]').forEach((el, i) => {
    lbSrcs.push(el.dataset.lb);
    el.onclick = () => { lbIdx = i; openLb(); };
  });
}
function openLb() {
  if (!$lb || !$lbImg) return;
  $lbImg.src = lbSrcs[lbIdx];
  $lb.classList.add('open');
}
function closeLightbox() { $lb?.classList.remove('open'); }
function lbStep(d) {
  lbIdx = (lbIdx + d + lbSrcs.length) % lbSrcs.length;
  if ($lbImg) $lbImg.src = lbSrcs[lbIdx];
}
document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
document.getElementById('lb-prev')?.addEventListener('click',  () => lbStep(-1));
document.getElementById('lb-next')?.addEventListener('click',  () => lbStep(1));
$lb?.addEventListener('click', e => { if (e.target === $lb) closeLightbox(); });
initLightbox();

// ── CONTACT FORM ──────────────────────────────────────────────────────────
const $form = document.getElementById('contact-form');
if ($form) {
  $form.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn     = document.getElementById('cf-btn');
    const btnText = document.getElementById('cf-btn-text');
    const success = document.getElementById('cf-success');
    btnText.textContent = 'Sending...';
    btn.disabled = true;
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(new FormData($form)).toString()
      });
      $form.style.opacity = '0.4';
      $form.style.pointerEvents = 'none';
      success.style.display = 'block';
    } catch(err) {
      btnText.textContent = 'Send Message';
      btn.disabled = false;
      alert('Something went wrong — please email directly.');
    }
  });
}

// ── LOAD MORE ─────────────────────────────────────────────────────────────
function initLoadMore(gridId, btnId, countId, wrapId, perPage) {
  const grid = document.getElementById(gridId);
  const btn  = document.getElementById(btnId);
  const count= document.getElementById(countId);
  if (!grid || !btn) return;

  const cards = Array.from(grid.children);
  const total = cards.length;
  let shown = 0;

  function showNext() {
    const next = Math.min(shown + perPage, total);
    for (let i = shown; i < next; i++) {
      cards[i].style.display = '';
      setTimeout(() => cards[i].classList.add('visible'), (i - shown) * 60);
    }
    shown = next;
    if (count) count.textContent = shown + ' / ' + total;
    if (shown >= total) {
      btn.classList.add('hidden');
      if (count) count.textContent = 'All ' + total + ' shown';
    }
  }

  cards.forEach(c => { c.style.display = 'none'; c.classList.remove('visible'); });
  showNext();
  btn.addEventListener('click', showNext);
}

initLoadMore('film-grid', 'film-load-more', 'film-load-count', 'film-load-more-wrap', 10);
initLoadMore('c-gallery', 'c-load-more',    'c-load-count',    'c-load-more-wrap',    10);
