/* ── cursor ── */
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top  = e.clientY + 'px';
});
function bindCursor() {
  document.querySelectorAll('a, button, .cell').forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('expand'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('expand'));
  });
}
bindCursor();

// nav scroll background
const nav = document.querySelector('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── YouTube ID extractor ── */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

/* ── mode switching (index page only) ── */
let currentMode = 'film';
window.setMode = function(mode) {
  if (mode === currentMode) return;
  currentMode = mode;

  const tabFilm = document.getElementById('tabFilm');
  const tabPhoto = document.getElementById('tabPhoto');
  if (tabFilm) tabFilm.classList.toggle('dim', mode !== 'film');
  if (tabPhoto) tabPhoto.classList.toggle('dim', mode !== 'photo');

  document.body.classList.toggle('photo-mode', mode === 'photo');

  window.scrollTo({ top: 0, behavior: 'smooth' });

  setTimeout(() => {
    const sel = mode === 'film' ? '#filmWork .cell' : '#photoWork .cell';
    const cells = document.querySelectorAll(sel);
    cells.forEach(c => { c.classList.remove('visible'); void c.offsetWidth; });
    if (mode === 'photo') {
      cells.forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 100));
    } else {
      revealCells(cells);
    }
    bindCursor();
    bindCells();
  }, 150);
};

/* ── cell reveal ── */
function revealCells(cells) {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const i = [...cells].indexOf(entry.target);
        setTimeout(() => entry.target.classList.add('visible'), i * 110);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });
  cells.forEach(c => io.observe(c));
}

const filmCells = document.querySelectorAll('#filmWork .cell');
if (filmCells.length) revealCells(filmCells);

// fallback
setTimeout(() => {
  document.querySelectorAll('.cell').forEach(c => c.classList.add('visible'));
}, 800);

/* ── bind cell clicks ── */
function bindCells() {
  document.querySelectorAll('.cell').forEach(cell => {
    const ytId = getYouTubeId(cell.dataset.video || '');

    if (ytId) {
      cell.onclick = () => openOverlay(cell);

      let previewIframe = null;
      let hoverTimer = null;

      cell.addEventListener('mouseenter', () => {
        hoverTimer = setTimeout(() => {
          if (previewIframe) return;
          previewIframe = document.createElement('iframe');
          previewIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${ytId}&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1`;
          previewIframe.allow = 'autoplay; encrypted-media';
          previewIframe.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;border:none;z-index:1;opacity:0;transition:opacity .4s ease;';
          const clickGuard = document.createElement('div');
          clickGuard.style.cssText = 'position:absolute;inset:0;z-index:2;cursor:none;';
          clickGuard.onclick = () => openOverlay(cell);
          cell.appendChild(previewIframe);
          cell.appendChild(clickGuard);
          requestAnimationFrame(() => requestAnimationFrame(() => {
            previewIframe.style.opacity = '1';
          }));
        }, 300);
      });

      cell.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimer);
        if (previewIframe) {
          previewIframe.style.opacity = '0';
          const toRemove = previewIframe;
          previewIframe = null;
          setTimeout(() => {
            toRemove.remove();
            const guard = cell.querySelector('div[style*="z-index:2"]');
            if (guard) guard.remove();
          }, 420);
        }
      });

    } else if (cell.closest('#photoWork')) {
      cell.onclick = () => openPhotoOverlay(cell);
    }
  });
}
bindCells();

/* ══ COLOUR EXTRACTION ══ */
function getDominantColors(img, count = 6) {
  const canvas = document.createElement('canvas');
  const size = 80;
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, size, size);
  const data = ctx.getImageData(0, 0, size, size).data;
  const buckets = {};
  for (let i = 0; i < data.length; i += 4) {
    const r = Math.round(data[i]   / 24) * 24;
    const g = Math.round(data[i+1] / 24) * 24;
    const b = Math.round(data[i+2] / 24) * 24;
    const key = `${r},${g},${b}`;
    buckets[key] = (buckets[key] || 0) + 1;
  }
  return Object.entries(buckets)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(([k]) => { const [r,g,b] = k.split(',').map(Number); return {r,g,b}; });
}

function lum({r,g,b}) { return 0.299*r + 0.587*g + 0.114*b; }
function rgb({r,g,b}, a=1) { return `rgba(${r},${g},${b},${a})`; }

/* ══ VIDEO OVERLAY ══ */
const overlay       = document.getElementById('overlay');
const overlayBg     = document.getElementById('overlayBg');
const overlayIframe = document.getElementById('overlayIframe');
let overlayOpen = false;

function openOverlay(cell) {
  if (overlayOpen || !overlay) return;
  overlayOpen = true;

  const thumb = cell.querySelector('.cell-media');
  const videoSrc = cell.dataset.video || '';

  let colors = [];
  try { colors = getDominantColors(thumb); } catch(e) { colors = [{r:18,g:18,b:18}]; }

  const sorted = [...colors].sort((a,b) => lum(a) - lum(b));
  const dark = sorted[0];
  const mid  = sorted[Math.floor(sorted.length * .4)] || dark;
  const mid2 = sorted[Math.floor(sorted.length * .7)] || mid;

  function darken({r,g,b}, f=.55) {
    return {r: Math.round(r*f), g: Math.round(g*f), b: Math.round(b*f)};
  }

  overlayBg.style.background =
    `radial-gradient(ellipse at 30% 60%, ${rgb(darken(mid2,.7))} 0%, ${rgb(darken(mid,.5))} 45%, ${rgb(darken(dark,.4))} 100%)`;

  const ytId = getYouTubeId(videoSrc);
  if (ytId) {
    overlayIframe.src = `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
  }

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', escClose);
}

window.closeOverlay = function() {
  if (!overlayOpen || !overlay) return;
  overlay.classList.remove('active');
  overlayIframe.src = '';
  document.body.style.overflow = '';
  overlayOpen = false;
  document.removeEventListener('keydown', escClose);
};

function escClose(e) { if (e.key === 'Escape') closeOverlay(); }
if (overlay) {
  overlay.addEventListener('click', e => {
    if (e.target === overlay || e.target === overlayBg) closeOverlay();
  });
}

/* ══ PHOTO LIGHTBOX ══ */
const photoOverlay    = document.getElementById('photoOverlay');
const photoOverlayBg  = document.getElementById('photoOverlayBg');
const photoOverlayImg = document.getElementById('photoOverlayImg');
const photoOverlayWrap = document.getElementById('photoOverlayWrap');
const photoCounter    = document.getElementById('photoOverlayCounter');

let photoCells = [];
let photoIndex = 0;

function openPhotoOverlay(cell) {
  photoCells = [...document.querySelectorAll('#photoWork .cell')];
  photoIndex = photoCells.indexOf(cell);
  showPhoto(photoIndex);
  photoOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
  document.addEventListener('keydown', photoKeyHandler);
}

function showPhoto(i) {
  const cell = photoCells[i];
  const img = cell.querySelector('.cell-media');
  const src = img ? img.src : '';

  photoOverlayWrap.style.opacity = '0';
  photoOverlayWrap.style.transform = 'scale(.97)';

  setTimeout(() => {
    photoOverlayImg.src = src;
    photoCounter.textContent = `${i + 1} / ${photoCells.length}`;

    let colors = [];
    try { colors = getDominantColors(img); } catch(e) { colors = [{r:18,g:18,b:18}]; }
    const sorted = [...colors].sort((a,b) => lum(a) - lum(b));
    const dark = sorted[0];
    const mid  = sorted[Math.floor(sorted.length * .4)] || dark;
    const mid2 = sorted[Math.floor(sorted.length * .7)] || mid;
    function darken({r,g,b}, f=.55) { return {r:Math.round(r*f),g:Math.round(g*f),b:Math.round(b*f)}; }
    photoOverlayBg.style.background =
      `radial-gradient(ellipse at 30% 60%, ${rgb(darken(mid2,.75))} 0%, ${rgb(darken(mid,.55))} 45%, ${rgb(darken(dark,.45))} 100%)`;

    photoOverlayWrap.style.transition = 'opacity .35s ease, transform .35s cubic-bezier(.16,1,.3,1)';
    photoOverlayWrap.style.opacity = '1';
    photoOverlayWrap.style.transform = 'scale(1)';
  }, 180);
}

window.photoNav = function(dir) {
  photoIndex = (photoIndex + dir + photoCells.length) % photoCells.length;
  showPhoto(photoIndex);
};

window.closePhotoOverlay = function() {
  if (!photoOverlay) return;
  photoOverlay.classList.remove('active');
  document.body.style.overflow = '';
  document.removeEventListener('keydown', photoKeyHandler);
  setTimeout(() => { photoOverlayImg.src = ''; }, 500);
};

function photoKeyHandler(e) {
  if (e.key === 'Escape') closePhotoOverlay();
  if (e.key === 'ArrowRight') photoNav(1);
  if (e.key === 'ArrowLeft') photoNav(-1);
}

if (photoOverlayWrap) {
  photoOverlayWrap.addEventListener('click', e => e.stopPropagation());
}
