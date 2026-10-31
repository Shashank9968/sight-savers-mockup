// Scleral-lens photo figure: a real close-up eye photo, not a 3D rig. All this script does is
// (1) track the pointer for the glare's gentle parallax and (2) show a plain-English description of whichever part is clicked
// (labels are buttons; a click anywhere on the photo resolves to the nearest part) and drive the tear-reservoir reveal
// (hover is handled by CSS alone; this adds the persistent tap/keyboard state and the readout
// text swap, which CSS can't do). Everything here is progressive enhancement -- the figure is
// already legible, laid out and (via :hover in photoreal.css) interactive without it.
(function () {
  const stage = document.querySelector('[data-pr-stage]');
  if (!stage) return;
  const glare = stage.querySelector('[data-pr-glare]');
  const readout = document.querySelector('[data-pr-readout]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  // Resting highlight position: roughly where the lens's own catchlight sits in the photo.
  const REST_X = 42, REST_Y = 38;

  function setGlare(xPct, yPct) {
    if (!glare) return;
    stage.style.setProperty('--gx', xPct.toFixed(1) + '%');
    stage.style.setProperty('--gy', yPct.toFixed(1) + '%');
  }

  function onMove(e) {
    if (reduce.matches) return;
    const r = stage.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const px = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const py = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
    // Gentle parallax: the highlight drifts toward the pointer but only travels about a third
    // of the stage, so it reads as a reflection shifting, not a spotlight chasing the cursor.
    setGlare(REST_X + (px * 100 - REST_X) * 0.35, REST_Y + (py * 100 - REST_Y) * 0.35);
  }

  function onLeave() {
    setGlare(REST_X, REST_Y);
  }

  stage.addEventListener('pointermove', onMove);
  stage.addEventListener('pointerleave', onLeave);
  setGlare(REST_X, REST_Y);

  const REST_TEXT = stage.getAttribute('data-rest-readout') || (readout && readout.textContent) || '';
  const REVEAL_TEXT = stage.getAttribute('data-reveal-readout') || REST_TEXT;
  const labels = Array.from(stage.querySelectorAll('.pr-label[data-part]'));
  const marks = stage.querySelectorAll('.pr-leaders [data-part]');
  // geometry of the photo (percent of the 16:9 image, same numbers photoreal.py uses): lens centre,
  // pupil radius and lens-edge radius, so a click resolves to the part the pointer is really over.
  const AR = 16 / 9, CX = 51.27, CY = 51.22, R_PUPIL = 3.9, R_LENS = 18.07;
  let current = null;

  function setReadout(btn) {
    if (!readout) return;
    readout.textContent = '';
    if (btn) {
      const b = document.createElement('b');
      b.textContent = btn.getAttribute('data-name');
      readout.append(b, document.createTextNode(' ' + btn.getAttribute('data-desc')));
      readout.setAttribute('data-part', btn.getAttribute('data-part'));
    } else {
      readout.removeAttribute('data-part');
      readout.textContent = stage.matches(':hover') ? REVEAL_TEXT : REST_TEXT;
    }
  }

  function select(btn) {
    current = btn;
    labels.forEach(function (l) {
      const on = l === btn;
      l.setAttribute('aria-pressed', String(on));
      l.classList.toggle('is-active', on);
    });
    marks.forEach(function (m) { m.classList.toggle('is-active', !!btn && m.getAttribute('data-part') === btn.getAttribute('data-part')); });
    stage.setAttribute('data-active', btn ? btn.getAttribute('data-part') : '');
    stage.setAttribute('data-revealed', String(!!btn && btn.getAttribute('data-part') === 'tear'));
    setReadout(btn);
  }

  function nearest(xPct, yPct) {
    // distance from the lens centre in photo-width units (so circles stay circles)
    const dx = xPct - CX, dy = (yPct - CY) / AR, d = Math.hypot(dx, dy);
    const byPart = function (k) { return labels.find(function (l) { return l.getAttribute('data-part') === k; }); };
    if (d <= R_PUPIL) return byPart('pupil');
    if (d > R_LENS * 1.12) return byPart('sclera');
    let best = null, bd = Infinity;
    labels.forEach(function (l) {
      const k = l.getAttribute('data-part');
      if (k === 'sclera' || k === 'pupil') return;
      const p = (l.getAttribute('data-dot') || '').split(',').map(Number);
      const e = Math.hypot(xPct - p[0], (yPct - p[1]) / AR);
      if (e < bd) { bd = e; best = l; }
    });
    return best;
  }

  labels.forEach(function (l) {
    l.addEventListener('click', function (e) {
      e.stopPropagation();
      select(current === l ? null : l);
    });
  });
  stage.addEventListener('click', function (e) {
    const r = stage.getBoundingClientRect();
    if (!r.width) return;
    const btn = nearest((e.clientX - r.left) / r.width * 100, (e.clientY - r.top) / r.height * 100);
    if (btn) select(btn);
  });
  stage.addEventListener('pointerenter', function () { if (!current) setReadout(null); });
  stage.addEventListener('pointerleave', function () { if (!current) setReadout(null); });
  setReadout(null);
})();
