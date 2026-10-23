// Scleral-lens photo figure: a real close-up eye photo, not a 3D rig. All this script does is
// (1) track the pointer for the glare's gentle parallax and (2) toggle the tear-reservoir reveal
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

  function updateReadout() {
    if (!readout) return;
    const active = stage.getAttribute('data-revealed') === 'true' || stage.matches(':hover');
    readout.textContent = active ? REVEAL_TEXT : REST_TEXT;
  }

  stage.addEventListener('click', function () {
    const next = stage.getAttribute('data-revealed') !== 'true';
    stage.setAttribute('data-revealed', String(next));
    stage.setAttribute('aria-pressed', String(next));
    updateReadout();
  });
  stage.addEventListener('pointerenter', updateReadout);
  stage.addEventListener('pointerleave', updateReadout);
  updateReadout();
})();
